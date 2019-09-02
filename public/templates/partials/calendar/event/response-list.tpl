{{{ if users.length }}}
  {{{ each users }}}
  <li class="icon pull-left">
    <a href="{config.relative_path}/user/{users.userslug}">{buildAvatar(users, "md", false)}</a>
  </li>
  {{{ end }}}
{{{ else }}}
  [[calendar:no_x_responses, [[calendar:response_{responseType}]]]]
{{{ end }}}