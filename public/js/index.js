$(function() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'listWeek,month'
        },
        defaultView: 'listWeek',
        // 這個 API 金鑰寫了存取限制
        googleCalendarApiKey: 'AIzaSyC97f3HHOnumbwC5eNkk9qGw4Qxs5SiVtw',
        events: {
            googleCalendarId: '11001@tlhc.ylc.edu.tw',
            color: '#d86712', // an option!
            textColor: '#FFF' // an option!
        },
        eventClick: function(event) {
            // opens events in a popup window
            window.open(event.url, '_blank', 'width=700,height=600');
            return false;
        }
    });
});