import {createBindingFromClass} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import {Task} from '../models/task.model';
import {TaskRepository} from '../repositories';

@cronJob()
class CleanTask extends CronJob {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {
    super({
      name: 'clean-task-cronjob',
      onTick: async function onTick() {
        console.log('running cronjob');
        await cleanDoneTasks(taskRepository);
      },
      cronTime: '0 * * * *',
      start: true,
      runOnInit: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }
}

const cleanTaskBinding = createBindingFromClass(CleanTask);

export default cleanTaskBinding;

async function cleanDoneTasks(taskRepository: TaskRepository) {
  try {
    const cleanTasks: Task[] = await taskRepository.find({
      where:{
        isDone: true
      }
    })
    await Promise.all(
      cleanTasks.map(item => taskRepository.updateById(item.id, {
        isDeleted: true
      })),
    );
    console.log('Cronjob: CleanTask ran successfully!');
  } catch (error) {
    console.warn('Cronjob: CleanTask ran failed! Error: ', error);
  }
}