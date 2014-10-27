<h1><i class="fa fa-calendar"></i> Calendar Permissions configuration</h1>
<hr />

<div class="bg-primary alert">
    <p>This page allows the admin to configure what groups and users can edit, create, and administrate events.</p>
</div>

<h2>Explanation</h2>
<p>
  Users and groups with creation rights can create their own events and edit their own events. They can't edit others' events, though.
  <br><br>
  Calendar editors can create their own events and edit other people's events but can't delete other people's events.
  <br><br>
  Calendar admins can create their own events, edit other people's events, and delete other people's events.
  Site admins get these rights as well, so there's no need to add them here.
</p>
<p>
  When filling out the following forms, keep in mind that these are global permissions for every single event.
  They can't be restricted by event-specific negations.
  <br>
  If you want to configure editing and viewing rights for individual events, do that in the Calendar interface itself.
</p>
<button id="save-button" class="btn btn-primary">Save</button>
<p>
  The following forms must be filled with the following syntax:
  <br> - Values are separated by commas
  <br> - Usernames are prefixed with an "at" symbol (@)
  <br> - Higher levels get all permissions of lower levels (admins > editors > creation rights)
</p>
<br>
<div class="inputContainer">
  <div>
    Creation rights:
    <input class="creators form-control" placeholder="Groups & users that can create events" value="{perms.createEvents}" />
  </div>
  <div>
    Editors:
    <input class="editors form-control" placeholder="Groups & users that can edit events" value="{perms.editEvents}" />
  </div>
  <div>
    Admins:
    <input class="admins form-control" placeholder="Groups & users that are admins" value="{perms.admin}" />
  </div>
</div>
<br>
<hr>
The category where event posts will be created, and the comments of those events will be:
<input class="category form-control" placeholder="Enter a category number" value="{category}" />

<style>

#save-button {
  float: right;
}
.inputContainer > div {
  display:inline-block;
  width:25%;
  margin-left: 5%;
}

</style>

<script>

$("#save-button").click(function(){
  $.post("/api/admin/plugins/calendar/save", {
    perms: {
      createEvents: $(".creators").val(),
      editEvents: $(".editors").val(),
      admin: $(".admins").val()
    },
    category: $(".category").val()
  }, function(data){
    if(typeof data === "string"){
      app.alertSuccess(data);
    }
  });
});

</script>
