import React, { Component } from "react";
import axios from 'axios';

class Search extends Component {
  constructor() {
    super();

    this.state = {
      value: "",
      data: []
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange({ target }) {
    const that = this;
    const { value } = target;
    axios({
      url: `http://localhost:3001/search?q=${value}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function({ data }) {
      console.log(data.data, '>>>');
      that.setState(() => {
        return {
          value,
          data
        };
      });
    })
  }

  render() {
    return (
      <>
        <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <div>
          {this.state && this.state.data && this.state.data.data && this.state.data.data.map(function(data, index) {
            console.log(data, '<<<')
            return (
              // <div key={index}>{data._source.name}</div>
              // <div key={index}>{data.highlight.name || data._source.name}</div>
              <div kye={index} dangerouslySetInnerHTML={{ __html: data.highlight.city || data._source.city }} />
            )
          })}
        </div>
      </>
    );
  }
}

export default Search;
