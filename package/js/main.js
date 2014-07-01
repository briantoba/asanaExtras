// Run
setInterval(process, 10000);
setTimeout(process, 5000);
document.addEventListener("mouseup", process, true);
document.addEventListener("keyup", process, true); 

var periods = { "w-": { name: "Workday", time: 18 },
				"h-": { name: "Home", time: 22 }}

// Functions
function process(e) {
	var groupToday = $(".center-pane-lower-body"); //$(".group.today_group"),
		taskElements = groupToday.find(".task-row-text-input"),
		sprints = [],
		remaining = 0;
		
	taskElements.each(function() {
		var task = $(this).val();
		
		if (/.*:/.test(task)) {
			// Sprint (because it hast a colon at the end)
			sprints.push({ name: task, element: this, tasks: [] });
		} else {
			if (sprints.length == 0) {
				// Skip tasks outside of a sprint
				return;
			}
			
			sprints[sprints.length - 1].tasks.push({ name: task, element: this });
		}
	});	
	
	for (var i in sprints) {
		var sprint = sprints[i],
			elem = $(sprint.element),
			val = elem.val(),
			points = calculatePoints(sprint),
			summary,
			container = elem.parent().parent(),
			remainingText = "",
			overbookedText = "",
			todayIndicator = "";		
		
		summary = container.parent().find(".asanaExtras_summary")
		
		if (summary.length == 0) {
			summary = $("<span class='asanaExtras_summary'></span>");
			summary.insertBefore(container.find(".bar_input_span"));
		}

		summary.removeClass("asanaExtras_notime");
		summary.removeClass("asanaExtras_today");

		for (var iPeriod in periods) {
			var period = periods[iPeriod],
			regex = new RegExp(iPeriod + ".*")

			// Check if the sprint starts with a star
			if (regex.test(sprint.name)) {
				remaining = remainingHours(period.time);
				todayIndicator = period.name + "  ===> ";
				remainingText = " {" + remaining.toFixed(1) + "h} ";
				
				if (points.points > remaining) {
					summary.addClass("asanaExtras_notime");
					overbookedText = " OVERBOOKED";
				}

				summary.addClass("asanaExtras_today");
				break;
			}
		}
		
		summary.text(todayIndicator +
					 "#" + sprint.tasks.length + "  " +
				     points.points.toFixed(1) + "h" +
					 (points.unknown > 0 ? " " + points.unknown + "?" : "") +
					 remainingText +
					 overbookedText);
		
		if (points.unknown > 0) {
			summary.addClass("asanaExtras_warn");
			summary.removeClass("asanaExtras_bad");
		} else {
			summary.removeClass("asanaExtras_warn");
			
			if (points.points > 6.5) {
				summary.addClass("asanaExtras_bad");
			} else {
				summary.removeClass("asanaExtras_bad");
			}
		}
		
		
	}
}

function calculatePoints(sprint) {
	var points = 0,
		unknown = 0;
	
	for (var i in sprint.tasks) {
		var task = sprint.tasks[i],
			match = task.name.match(/\[(.*)\]/);
			
		if (match != null && match.length > 1) {
			try {
				var p = parseFloat(match[match.length - 1]);
				
				if (p == NaN) {
					unknown++;
				} else {
					points += p;
				}
			}
			catch (e) {
				unknown++;
			}
		} else {
			unknown++;
		}
	}
	
	return { points: points, unknown: unknown };
}

function remainingHours(untilTime, now) {
    now = now || new Date();
    
    untilDate = new Date(now.getYear() + 1900, now.getMonth(), now.getDate(), untilTime, 0, 0);
    
    console.log(untilDate);
    console.log(now);
    
    return (untilDate - now)/1000/60/60;
}