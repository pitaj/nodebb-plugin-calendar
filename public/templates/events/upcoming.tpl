{{{ each categories }}}
<div class="event-category">
  <p>Category name: {./name}</p>
  <p>Category id: {./cid}</p>

  <div>
    <h2>Events</h2>
    {{{ each ./events }}}
    <div class="event">
      <p>Name: {./name}</p>
      <p>Datetime: {./startDate} - {./endDate}</p>
      <p>User: {./user.username}</p>
      <p>Post: {./pid}</p>
    </div>
    {{{ end }}}
  </div>
</div>
{{{ end }}}