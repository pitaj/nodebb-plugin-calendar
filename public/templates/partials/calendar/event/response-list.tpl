{{{ if users.length }}}
  {{{ each users }}}
  <li class="icon pull-left">
    <a href="{config.relative_path}/user/{users.userslug}">
      {{{ if users.picture }}}
      <img title="{users.username}" class="avatar avatar-md not-responsive" src="{users.picture}">
      {{{ else }}}
      <div class="avatar avatar-md" style="background-color: {users.icon:bgColor};" title="{users.username}">{users.icon:text}</div>
      {{{ end }}}
    </a>
  </li>
  {{{ end }}}
{{{ else }}}
  [[calendar:no_x_responses, [[calendar:response_{responseType}]]]]
{{{ end }}}