console.log("Hello World");

// Run
process();
setInterval(process, 10000);
//$(".group.today_group").bind("DOMSubtreeModified", process);

// Functions
function process(e) {
	var groupToday = $(".group.today_group"),
		taskElements = groupToday.find(".task-row-text-input"),
		sprints = [];
		
	taskElements.each(function() {
		var task = $(this).val();
		
		if (/.*:/.test(task)) {
			// Sprint
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
			container = elem.parent().parent();		
		
		summary = container.parent().find(".asanaExtras_summary")
		
		if (summary.length == 0) {
			summary = $("<span class='asanaExtras_summary'></span>");
			summary.insertBefore(container);
		}
		
		summary.text("#" + sprint.tasks.length + " " + points.points.toFixed(2) + "h " + points.unknown + "?");
		
		if (points.unknown > 0) {
			summary.addClass("asanaExtras_warn");
		} else {
			summary.removeClass("asanaExtras_warn");
		}
		
		if (points.points > 8) {
			summary.addClass("asanaExtras_bad");
		} else {
			summary.removeClass("asanaExtras_bad");
		}
	}
		
	taskElements.map(function() {
			return $(this).val();
		})
		.get()
		.join();
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