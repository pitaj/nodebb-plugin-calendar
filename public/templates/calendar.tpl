<h1><i class="fa fa-calendar"></i> Calendar</h1>
<hr />
<br>
<div id="toolbar">
  <div class="arrow-group">
    <button class="button-left-arrow" type="button" >&lt;</button>
    <button class="button-right-arrow" type="button" >&gt;</button>
    <button class="button-today" type="button" >today</button>
  </div>
  <div class="center">
    August 2014
  </div>
  <div class="right">

  </div>
</div>
<table id="cal">
  <tbody>
    <tr id="days">
      <td>
        Sun
      </td>
      <td>
        Mon
      </td>
      <td>
        Tue
      </td>
      <td>
        Wed
      </td>
      <td>
        Thu
      </td>
      <td>
        Fri
      </td>
      <td>
        Sat
      </td>
    </tr>
    <tr>
      <td>
        <span class="day-number other-month">27</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
        <div class="event sevenwide">
          <span class="time">4p</span> test event
        </div>
      </td>

      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
      <td>
        <span class="day-number">28</span>
        <div class="event">
          <span class="time">4p</span> test event
        </div>
      </td>
    </tr>
    <tr>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
    </tr>
    <tr>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
    </tr>
    <tr>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
    </tr>
    <tr>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
    </tr>
    <tr>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
      <td>
      </td>
    </tr>
  </tbody>
</table>

<style>

  #cal {
    font-size: 14px;
    border-collapse: collapse;
    font-family: Lato, sans-serif;
    width: 875px;
  }
  #cal td {
    border: 1px solid #ddd;
    margin: 0;
    padding: 2px;
    max-width: 120px;
    width: 120px;
    position: relative;
  }
  #cal tr {
    height: 120px;
    vertical-align: top;
    text-align:right;
  }
  #cal #days {
    height: 21px;
    color: #444;
    text-align: center;
  }
  #cal .event {
    text-align: left;
    font-size: .85em;
    line-height: 1.3;
    border-radius: 3px;
    border: 1px solid #3a87ad;
    background-color: #3a87ad;
    font-weight: normal;
    color: whitesmoke;
    padding: 0 1px;
    overflow: hidden;
    margin-bottom: 2px;
  }
  #cal .event .time {
    font-weight: bold;
  }
  #cal .event.linked {
    cursor: pointer;
  }

  #cal .event.twowide {
    width: 240px;
  }

  #cal .event.threewide {
    width: 365px;
  }

  #cal .event.fourwide {
    width: 490px;
  }

  #cal .event.fivewide {
    width: 615px;
  }

  #cal .event.sixwide {
    width: 740px;
  }

  #cal .event.sevenwide {
    width: 865px;
  }

  #cal td .day-number {
    display: block;
    padding-right: 3px;
    color: #444;
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 300;
    height: 17px;
    margin-bottom: 6px;
  }

  #cal td .day-number.other-month {
    opacity: 0.3;
  }

  #toolbar {
    margin-bottom: 1em;
    font-family: Lato, sans-serif;
    text-align: center;
    width: 875px;
  }

  #toolbar .center {
    display: inline-block;
    font-size: 22px;
    color: #444;
  }

  #toolbar .arrow-group {
    float: left;
    width: 145px;
  }

  #toolbar .right {
    float: right;
    width: 145px;
    height:30px;
  }

  #toolbar .arrow-group button {
    box-sizing: border-box;
    height: 2.1em;
    padding: 0 .6em;
    font-size: 1em;
    white-space: nowrap;
    cursor: pointer;
    display: inline-block;
    border: 1px solid;
    background-color: #f5f5f5;
    background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);
    background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);
    background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);
    background-repeat: repeat-x;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    color: #333;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: Arial;
    font-size: 14px;
    height: 30px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 0;
    text-shadow: rgba(255, 255, 255, 0.74902) 0px 1px 1px;
  }

  #toolbar .arrow-group .button-left-arrow {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    font-weight: bold;
    margin-left: 1px;
    width: 41px;
  }

  #toolbar .arrow-group .button-right-arrow {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    font-weight: bold;
    margin-left: -5px;
    width: 41px;
  }

  #toolbar .arrow-group .button-today {
    border-radius: 4px;
  }

  #toolbar .arrow-group button:active {
    color: #333333;
    background-color: #cccccc;
    background-image: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  #toolbar .arrow-group button:hover {
    background-color: #e6e6e6;
    color: #333333;
    text-decoration: none;
    background-position: 0 -15px;
    transition: background-position 0.1s linear;
  }

</style>
