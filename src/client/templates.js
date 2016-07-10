const eventTemplate = event => (
  `[event]
    [name]${event.name}[/name]
    [allday]${event.allday}[/allday]
    [startDate]${event.startDate}[/startDate]
    [endDate]${event.endDate}[/endDate]
    [notifications]${JSON.stringify(event.notifications)}[/notifications]
    [location]${event.location}[/location]
    [description]
      ${event.description}
    [/description]
  [/event]`
);

const modalTemplate = () => (
  `<div class="modal fade" id="plugin-calendar-event-editor" tabindex="-1"
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
          <form>
            <div class="form-group">
              <label for="plugin-calendar-event-editor-name">Email address</label>
              <input type="email" class="form-control" id="plugin-calendar-event-editor-name" 
              placeholder="Email">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">
            [[global:buttons.close]]
          </button>
          <button type="button" class="btn btn-primary">[[global:save_changes]]</button>
        </div>
      </div>
    </div>
  </div>`
);

export {
  eventTemplate,
  modalTemplate,
};
