schedules: selectedHiveMates.length > 0 ?
        selectedHiveMates.map((mate) => ({
        user_id: mate.user_id,
        start_date: startDate.toISOString().split('T')[0], // "YYYY-MM-DD", // Match "start_date"
        end_date: isRecurrenceNeverEnds ? null : endDate.toISOString().split('T')[0], // Match "end_date" // "YYYY-MM-DD"
        recurrence: recurrenceSelected, // Match "recurrence"
        dueTime: endTime.toISOString().split('T')[1].split('.')[0], // Match "dueTime" (adjust naming) // "HH:mm:ss"
      }))
