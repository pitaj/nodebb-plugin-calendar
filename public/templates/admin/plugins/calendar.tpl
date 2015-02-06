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
<p>
  [[calendar_admin:explanation_global_note]]
  <br><br>
  [[calendar_admin:explanation_individual_rights]]
</p>
<button id="save-button" class="btn btn-primary">[[global:save_changes]]</button>
<br>
<div class="inputContainer">
  <div>
    [[calendar_admin:creation_rights]]:
    <input type="text" class="creators form-control" placeholder="[[calendar_admin:creation_placeholder]" value="{create}" />
  </div>
  <div>
    [[calendar_admin:edit_rights]]:
    <input type="text" class="editors form-control" placeholder="[[calendar_admin:edit_placeholder]]" value="{edit}" />
  </div>
  <div>
    [[calendar_admin:admin_rights]]:
    <input type="text" class="admins form-control" placeholder="[[calendar_admin:admin_placeholder]]" value="{admins}" />
  </div>
</div>
<br>
<hr>
[[calendar_admin:category_label]]:
<input class="category form-control" placeholder="[[calendar_admin:category_placeholder]]" value="{category}" />
<hr>
[[calendar_admin:use_whoisin_label]]
<input type="checkbox" class="usewhoisin form-control" checked="{usewhoisin}" />

<style>
#save-button {
  float: right;
}
.inputContainer > div {
  display:inline-block;
  width:25%;
  margin-left: 8%;
}
</style>
<script src="/plugins/nodebb-plugin-calendar/public/typeahead.bundle.js"></script>
<script>
$("#save-button").click(function(){
  $.post("/api/admin/plugins/calendar/save", {
    create: $(".creators").val(),
    edit: $(".editors").val(),
    admin: $(".admins").val()
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

var engine = new Bloodhound({
  datumTokenizer: function(){
    return Bloodhound.tokenizers.obj.whitespace('name');
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 10,
  prefetch: {
    url: '/api/groups',
    filter: function(list) {
      var list = list.groups;
      return list.map(function(group) { return { name: group.name }; });
    }
  },
  remote: {
    url: '/api/groups',
    filter: function(list) {
      var list = list.groups;
      return list.map(function(group) { return { name: group.name }; });
    }
  },
});

engine.initialize();

$(".creators, .editors, .admins").typeahead(null, {
  name: 'groups',
  displayKey: 'name',
  source: engine.ttAdapter()
});
</script>
