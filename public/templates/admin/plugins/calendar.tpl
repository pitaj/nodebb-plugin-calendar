<h1><i class="fa fa-calendar"></i> [[calendar_admin:title]]</h1>
<hr />

<div class="bg-primary alert">
    <p>[[calendar_admin:intro]]</p>
</div>

<h2>[[calendar_admin:explanation_header]]</h2>
<p>
  [[calendar_admin:explanation_creation_rights]]
  <br><br>
  [[calendar_admin:explanation_edit_rights]]
  <br><br>
  [[calendar_admin:explanation_admin_rights]]
  <br><br>
  [[calendar_admin:explanation_hierarchy]]
  <br><br>
  [[calendar_admin:explanation_one_group]]
</p><br>
<button id="save-button" class="btn btn-primary">[[global:save_changes]]</button>
<p>
  [[calendar_admin:explanation_global_note]]
  <br><br>
  [[calendar_admin:explanation_individual_rights]]
</p>
<br>
<div class="inputContainer">
  <div>
    <!-- [[calendar_admin:creation_rights]]: -->
    <input type="text" class="creators form-control" placeholder="[[calendar_admin:creation_placeholder]]" value="{create}" />
  </div>
  <div>
    <!-- [[calendar_admin:edit_rights]]: -->
    <input type="text" class="editors form-control" placeholder="[[calendar_admin:edit_placeholder]]" value="{edit}" />
  </div>
  <div>
    <!-- [[calendar_admin:admin_rights]]: -->
    <input type="text" class="admins form-control" placeholder="[[calendar_admin:admin_placeholder]]" value="{admin}" />
  </div>
</div>
<br>
<hr>
[[calendar_admin:category_label]]:
<input class="category form-control" placeholder="[[calendar_admin:category_placeholder]]" value="{category}" />

<div class="checkbox">
  <label>
    <!-- IF usewhoisin -->
    <input type="checkbox" class="usewhoisin" checked>
    <!-- ELSE -->
    <input type="checkbox" class="usewhoisin">
    <!-- ENDIF usewhoisin -->
     [[calendar_admin:use_whoisin_label]]
  </label>
</div>

<style>
#save-button {
  float: right;
}
.inputContainer > div {
  display:inline-block;
  width:25%;
  margin-left: 8%;
}
.inputContainer > div > span {
  width:100%;
}
.tt-suggestion {
  padding: 3px 20px;
  clear: both;
  font-weight: 400;
  line-height: 1.42857143;
  color: #333;
  white-space: nowrap;
}
.tt-suggestion.tt-cursor {
  background-color: #f5f5f5;
}
</style>
<script src="/plugins/nodebb-plugin-calendar/public/typeahead.bundle.js"></script>
<script>
$("#save-button").click(function(){
  $.post("/api/admin/plugins/calendar/save", {
    create: $(".creators").val(),
    edit: $(".editors").val(),
    admin: $(".admins").val(),
    category: $(".category").val(),
    usewhoisin: $(".usewhoisin").prop("checked")
  }, function(data){
    if(data){
      app.alertSuccess();
    } else {
      app.alertError();
    }
  });
});

function groups(query, callback){
  socket.emit("groups.search", {
    query: query
  }, function(err, data){
    if(err){
      return app.alertError();
    }
    console.log(data);
    callback(data.map(function(group){
      group = {
        name: group.name,
        slug: group.slug
      };
      return group;
    }));
  });
}

$(".creators, .editors, .admins").typeahead(null, {
  name: 'groups',
  displayKey: 'name',
  source: groups
});
</script>
