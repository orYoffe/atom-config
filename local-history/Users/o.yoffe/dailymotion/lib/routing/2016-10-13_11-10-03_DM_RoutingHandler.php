<?php

class DM_RoutingHandler
{
    protected
        $dispatcher = null,
        $routing    = null,
        $routingConfig = null;

    static protected
        $instance   = null;

    protected function getConfigFiles()
    {
        return array_merge($this->routingConfig->getRoutingFiles(), array($this->routingConfig->getFormatsFile()));
    }

    protected function __construct(sfEventDispatcher $dispatcher, DM_RoutingConfiguration $config)
    {
        $this->routingConfig = $config;
        $cachePrefix = implode('.', array
        (
            defined('PARTNER_NAME') ? PARTNER_NAME : 'main',
            DM::getRunningEnvironment(),
        ));
        $cacheDir = CACHE_DIR . '/routing/' . $cachePrefix;
        $cache = new sfFileCache(array('cache_dir' => $cacheDir, 'lifetime' => 3600));
        if (filemtime($cacheDir) < max(array_map('filemtime', $this->routingConfig->getRoutingFiles())))
        {
            $cache->clean();
        }
        $dispatcher->connect('routing.load_configuration', array($this, 'configureRouting'));
        $this->routing = new DM_PatternRouting(
            $dispatcher,
            $cache,
            array
            (
                'lazy_routes_deserialize' => true,
                'lookup_cache_dedicated_keys' => false,
                'routing_cache_key' => $this->routingConfig->getCacheKey(),
            )
        );
    }

    static public function getInstance(sfEventDispatcher $dispatcher = null, DM_RoutingConfiguration $config = null)
    {
        if (!self::$instance)
        {
            self::$instance = new self($dispatcher, $config);
        }

        return self::$instance;
    }

    public function route(DM_Request $request)
    {
        $context = array
        (
            'path_info' => $request->getRequestURI(),
        );

        $request->setAttribute('script', getenv('script'));

        $parameters = $this->routing->parse($request->getRequestURI(), $context);

        if (false === $parameters)
        {
            return false;
        }

        // NOTE: we configure the request before we set parameters, because setParameter() have some
        //       dependancies on defaults params which are set by configureRequestForRoute().
        if (false === $this->configureRequestForRoute($request, $this->routing->getCurrentRouteName()))
        {
            return false;
        }

        // start with fresh parameters list
        $request->resetParameters();

        foreach ($parameters as $key => $value)
        {
            if ($key[0] === '_')
            {
                // ignore params starting with underscore (_)
                continue;
            }

            switch ($key)
            {
                //different types of routes
                case 'script': //simple script
                case 'page': //widgetV3 pageName
                case 'controller': //controller
                case 'dispatcher': //widgetV3 ajax dispatch
                case 'private': //only used to pass info (e.g /blog/blog_name or /comment/comment_id)
                    $request->setAttribute($key, $value);
                    break;
                default:
                    // don't overload parameters with empty value, combined with parameters aliases,
                    // it would have some random behaviors (ie: user and user_compat).
                    if (!is_null($value) && !empty($value))
                    {
                        $request->setParameter($key, $value);
                    }
                    break;
            }
        }

        return true;
    }

    public function configureRequestForRoute(DM_Request $request, $routeName, $previousRouteName = null)
    {
        $route = $this->getRoute($routeName);

        if (is_null($route))
        {
            // unexisting route, may happen when route name was specified manually
            return false;
        }

        $options = $route->getOptions();

        if (isset($options['visibility']) && $options['visibility'] == 'private' && $request->isGlobal())
        {
            // global request can't match a private route2
            return false;
        }

        if ($routeName == 'video_list' && true)
        {
            $routeName = 'home';
        }

        $request->setRouteName($routeName, false);
        $request->setAttribute('symfony_routed', true);
        $request->setObjectFactory($route->getParamObjectFactory());

        $defaults = $route->getDefaults();

        // HACK: because some route doesn't define a default parameter for some param because they
        // aren't optional, and because backward compatible DM_Request::getCriterias() method used by
        // DM_Selector_Backend use default parameters list to work : we add to the list of default
        // params requirements which are missing in the default param list with null default value.
        // This hack can be removed as soon as DM_Selector_Backend will be modified to no longer need
        // DM_Request::getCriterias() method to work.
        foreach (array_diff(array_keys($route->getRequirements()), array_keys($defaults)) as $param)
        {
            $defaults[$param] = null;
        }

        $request->setDefaultParameters($defaults);

        // When request is created from route via r('@route_name') or switched to a different route
        // via $request->setRouteName('route_name'), we have to apply new defaults for undefined
        // parameters
        if ($previousRouteName === null)
        {
            $request->getParameterHolder()->add(array_filter($defaults));
        }
        else
        {
            // previous route default parameters
            $previousDefaults = array_filter($this->getRoute($previousRouteName)->getDefaults());
            // parameters which wasn't equal to a previous route default parameter
            $previousNotDefaultParams = array_diff($request->getParameterHolder()->getAll(), $previousDefaults);
            // current parameters with old default removed and new defaults added
            $request->getParameterHolder()->add(array_merge(array_filter($defaults), $previousNotDefaultParams));
        }

        // Pass selector related configuration found in options section of the routing.yml.
        // This is ugly but for historical reason, request/routing/selector was strongly tied, thus
        // it's now too difficult to split them.
        if (isset($options['type']) && $options['type'] == 'list')
        {
            $request->setReqMode('collection');

            if (!isset($options['model']))
            {
                throw new Exception('The "model" option is mandatory in collection mode: ' . $routeName);
            }

            if (!isset($options['backends']))
            {
                throw new Exception('The "backends" option is mandatory in collection mode');
            }

            $request->setSelectorConfig
            (
                array
                (
                    'model' => $options['model'],
                    'validator' => isset($options['validator']) ? $options['validator'] : null,
                    'backends' => $options['backends'],
                    'static_filters' => isset($options['static_filters']) ? $options['static_filters'] : array(),
                    'static_criteria' => isset($options['static_criteria']) ? $options['static_criteria'] : array(),
                )
            );
        }
        elseif (isset($options['type']) && $options['type'] == 'item')
        {
            $request->setSelectorConfig(null);
            $request->setReqMode('member');
        }
        else
        {
            $request->setSelectorConfig(null);
            $request->setReqMode('action');
        }

        if(isset($options['shadows']))
        {
            $request->setShadowReferential($options['shadows']);
        }

        return true;
    }

    public function generate(DM_Request $request)
    {
        return $this->routing->generate($request->getRouteName(), $request->getParameterHolder()->getAll());
    }

    public function getRoute($routeName)
    {
        return $this->routing->getRouteByName($routeName);
    }

    public function configureRouting(sfEvent $event)
    {
        $files = $this->routingConfig->getRoutingFiles();
        $formatsFile = $this->routingConfig->getFormatsFile();

        $formats = sfYaml::load(file_get_contents($formatsFile));

        foreach (array_keys($formats) as $name)
        {
            $replaced = 1;

            while ($replaced)
            {
                $formats[$name] = preg_replace_callback('#\$\(([^\)]*)\)#', function($matches) use($formats) { return $formats[$matches[1]]; }, $formats[$name], -1, $replaced);
            }
        }

        $config = array();

        foreach (is_array($files) ? $files : array($files) as $file)
        {
            if (isset($file))
            {
                $config = array_merge_recursive($config, sfYaml::load(file_get_contents($file)));
            }
        }

        // collect routes
        foreach ($config as $name => $params)
        {
            if (isset($params['param']) && !isset($params['params']))
            {
                $params['params'] = $params['param'];
                unset($params['param']);
            }

            if (!isset($params['options']))
            {
                $params['options'] = array();
            }

            if (!isset($params['options']['object_factories']))
            {
                $params['options']['object_factories'] = array();
            }

            if (isset($params['requirements']))
            {
                foreach ($params['requirements'] as $key => $value)
                {
                    if (is_string($value) && preg_match('/^\$\(([^:]+)(?::([^\)]+))?\)$/', $value, $matches))
                    {
                        if (!isset($formats[$matches[1]]))
                        {
                            DM::errorLog('Reference to unexisting format: ' . $matches[1]);
                            continue;
                        }

                        $format = $formats[$matches[1]];

                        if (is_array($format))
                        {
                            // object factory info
                            foreach (array('class', 'create_method', 'serialize_method', 'exception') as $directive)
                            {
                                if (!isset($format[$directive]))
                                {
                                    throw new Exception(sprintf('Missing object factory configuration directive `%s\' in `%s\'', $directive, $matches[1]));
                                }
                            }

                            $params['options']['object_factories'][$key] = array
                            (
                                'class'             => $format['class'],
                                'create_method'     => $format['create_method'],
                                'serialize_method'  => $format['serialize_method'],
                                'exception'         => $format['exception'],
                            );

                            $format = $format['format'];
                        }

                        if (isset($matches[2]))
                        {
                            $params['requirements'][$key] = str_replace('%s', $matches[2], $format);
                        }
                        else
                        {
                            $params['requirements'][$key] = $format;
                        }
                    }
                }
            }

            $config[$name] = $params;
        }

        foreach ($config as $name => $params)
        {
            if ((isset($params['type']) && 'collection' == $params['type'])
                || (isset($params['class']) && false !== strpos($params['class'], 'Collection')))
            {
                $options = isset($params['options']) ? $params['options'] : array();
                $options['name'] = $name;
                $options['requirements'] = isset($params['requirements']) ? $params['requirements'] : array();

                $class = isset($params['class']) ? $params['class'] : 'sfRouteCollection';
                $arguments = array($options);
            }
            else
            {
                $class = isset($params['class']) ? $params['class'] : 'DM_Route';
                $arguments = array
                (
                    $params['url'] ? $params['url'] : '/',
                    isset($params['params']) ? $params['params'] : (isset($params['param']) ? $params['param'] : array()),
                    isset($params['requirements']) ? $params['requirements'] : array(),
                    isset($params['options']) ? $params['options'] : array(),
                );
            }

            $r = new ReflectionClass($class);
            $event->getSubject()->connect($name, $r->newInstanceArgs($arguments));
        }
    }
}
