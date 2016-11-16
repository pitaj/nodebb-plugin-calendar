<div class="modal fade" id="plugin-calendar-event-editor" tabindex="-1"
role="dialog" aria-labelledby="plugin-calendar-event-editor-title">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"
        aria-label="[[global:buttons.close]]">
          <i aria-hidden="true" class="fa fa-times"></i>
        </button>
        <h4 class="modal-title" id="plugin-calendar-event-editor-title">
          [[calendar:edit_event]]
        </h4>
      </div>
      <div class="modal-body">
        <!-- IMPORT partials/calendar/event-creation-form.tpl -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">
          [[modules:bootbox.cancel]]
        </button>
        <button type="button" class="btn btn-danger pull-left" aria-label="[[topic:delete]]"
        id="plugin-calendar-event-editor-delete">
          <i class="fa fa-trash-o"></i>
        </button>
        <button type="button" class="btn btn-primary" aria-label="[[global:save_changes]]"
        id="plugin-calendar-event-editor-submit">
          <i class="fa fa-save"></i>
        </button>
      </div>
    </div>
  </div>
</div>