'use client';

import type {UserProgress, Subject} from '@/lib/types';

interface TimeTableViewProps {
  day: string;
  subjects: Subject[];
  progress: UserProgress;
  onTaskToggle: (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => void;
}

const tasks = [
  {id: 'lecture', label: 'Attend Lecture'},
  {id: 'notes', label: 'Make Notes'},
  {id: 'homework', label: 'Complete Homework'},
  {id: 'revision', label: 'Revise'},
];

export function TimeTableView({
  day,
  subjects,
  progress,
  onTaskToggle,
}: TimeTableViewProps) {
  return (
    <div>
      <div style={{border: '1px solid black', padding: '1rem'}}>
        <h2>Today's Schedule ({day})</h2>
        <div>
          {subjects.length > 0 ? (
            <div>
              {subjects.map((subject: Subject, index: number) => (
                <div
                  key={`${subject.name}-${index}`}
                  style={{marginTop: '1rem'}}
                >
                  <div>
                    <h3>{subject.name}</h3>
                    <p>{subject.time}</p>
                  </div>
                  <div>
                    {tasks.map(task => (
                      <div key={task.id}>
                        <input
                          type="checkbox"
                          id={`${day}-${subject.name}-${task.id}`}
                          checked={
                            progress[day]?.[subject.name]?.[task.id] ?? false
                          }
                          onChange={e =>
                            onTaskToggle(
                              day,
                              subject.name,
                              task.id,
                              e.target.checked
                            )
                          }
                        />
                        <label htmlFor={`${day}-${subject.name}-${task.id}`}>
                          {task.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {index < subjects.length - 1 && (
                    <hr style={{margin: '1rem 0'}} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No classes scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}