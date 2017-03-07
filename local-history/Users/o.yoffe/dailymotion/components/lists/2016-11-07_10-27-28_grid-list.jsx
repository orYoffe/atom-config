import React, { Component } from 'react'
let gridCounter = 0 // for the key prop
class GridList extends Component {

  renderChild(child,i) {
    let { columns, margins, marginBottom, placeholder } = this.props
    console.log('---------marginBottom-------------', marginBottom)
    let style = {
      'width': `calc((100% - ${2*columns}*${margins}px) * ${1/columns})`,
      'margin': `0 ${margins}px ${marginBottom}px ${margins}px`
    }
    return (
      <div key={i} className="grid-list__item" style={style} >
        { child ? child : placeholder }
      </div>
    )

  }

  render() {

    let { fetching, children, margins, placeholder, numberOfPlacholders } = this.props

    if (fetching) {
      children = numberOfPlacholders ? new Array(numberOfPlacholders).fill(null) : new Array(9).fill(null)
      children = children.map(::this.renderChild)
    } else {
      children = React.Children.map(children, ::this.renderChild)
    }

    let gridListStyle = {
      'margin': `0 -${margins}px`
    }
    gridCounter++

    return (
      <div className="grid-list" style={gridListStyle} key={`grid_${gridCounter}`}>
        { children }
      </div>
    )
  }
}

GridList.defaultProps = {
  columns: 3,
  margins: 10,
  marginBottom: 35
}

export default GridList
