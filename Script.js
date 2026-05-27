document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // 1. Check if Schoology sent real data through the URL
    const urlParams = new URLSearchParams(window.location.search);
    const importedData = urlParams.get('assignments');
    
    let plannerAssignments = [];

    if (importedData) {
        try {
            // Decode and parse the real assignments from Schoology
            const parsed = JSON.parse(decodeURIComponent(importedData));
            
            // Map the real data to fit our beautiful layout
            plannerAssignments = parsed.map(asm => {
                // Determine a theme color based on assignment type
                let color = '#3b82f6'; // Default homework blue
                if (asm.type.includes('Exam') || asm.type.includes('Test')) color = '#ef4444';
                if (asm.type.includes('Quiz')) color = '#f59e0b';
                if (asm.type.includes('Presentation')) color = '#10b981';
                if (asm.type.includes('Study Guide')) color = '#8b5cf6';

                return {
                    title: asm.title,
                    start: asm.dueDate, // YYYY-MM-DD format
                    type: asm.type,
                    points: asm.points,
                    dueDateDisplay: asm.formattedDateString, // e.g. "Tomorrow (5/28) at 11:59 PM"
                    url: asm.link,
                    color: color
                };
            });
            
            // Update the sidebar totals with real numbers
            document.querySelector('.stat-number').innerText = plannerAssignments.length;
        } catch (e) {
            console.error("Error loading imported assignments", e);
        }
    } else {
        // FALLBACK: If no data is passed, show one placeholder so you know it works
        plannerAssignments = [{
            title: '👉 Go to Schoology and click your "Sync Planner" bookmark!',
            start: new Date().toISOString().split('T')[0],
            type: 'Notice',
            points: 0,
            dueDateDisplay: 'Setup Step',
            color: '#a1a1aa'
        }];
    }

    // 2. Initialize the Planner Calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'listWeek', 
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'listWeek,dayGridMonth'
        },
        events: plannerAssignments,
        
        eventContent: function(arg) {
            let typeTag = arg.event.extendedProps.type;
            let points = arg.event.extendedProps.points;
            let dueTime = arg.event.extendedProps.dueDateDisplay;
            let assignmentUrl = arg.event.extendedProps.url;
            let themeColor = arg.event.backgroundColor;

            let customEl = document.createElement('div');
            customEl.className = 'planner-row';
            customEl.innerHTML = `
                <div class="planner-type-badge" style="background-color: ${themeColor}">
                    ${typeTag}
                </div>
                <a href="${assignmentUrl}" target="_blank" class="planner-title-link">
                    <div class="planner-title">${arg.event.title} ↗</div>
                </a>
                <div class="planner-meta-right">
                    <div class="planner-points">💯 ${points} pts</div>
                    <div class="planner-due">⏰ ${dueTime}</div>
                </div>
            `;
            return { domNodes: [customEl] };
        }
    });

    calendar.render();
});
