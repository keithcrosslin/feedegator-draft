import React from 'react';
import './App.css';
const redditLogo = require('./reddit-logo.png');
const nytLogo = require('./nyt-logo.png'); //REMOVE IF NO NYT
const bbcLogo = require('./bbc-logo.png');

const Activities = ((props) => {
  if (props.activity.actor === 'reddit') {
    return (
      <div className='post'>
        <img className="actor-logo" alt="reddit-logo" src={redditLogo} />
        <img src={props.activity.thumbnail} alt="preview" className='thumbnail' />
        <div className="post-content">
          <a className="post-title" href={props.activity.url}>{props.activity.title}</a>
          <p className="subreddit">Posted by {props.activity.author} in r/{props.activity.subreddit}</p>
        </div>
      </div >
    );
  }
  else if (props.activity.actor === 'nyt') {
    return (
      <div className='post'>
        <img className="actor-logo news-logo" alt="nyt-logo" src={nytLogo} />
        <div className="post-content">
          <a className="post-title nyt-title" href={props.activity.object}>{props.activity.title}</a>
          <p className="abstract">{props.activity.abstract}</p>
          <p className="news-details">{props.activity.section} | {props.activity.date}</p>
        </div>
      </div>
    );
  }
  //else if for bbc
  else if (props.activity.actor === 'bbc') {
    return (
      <div className='post'>
        <img className="actor-logo news-logo" alt="bbc-logo" src={bbcLogo} />
        <div className="post-content">
          <a className="post-title news-title" href={props.activity.object}>{props.activity.title}</a>
          <p className="abstract">{props.activity.abstract}</p>
          <p className="news-details">{props.activity.date}</p>
        </div>
      </div>
    );
  }
});

export default Activities;
