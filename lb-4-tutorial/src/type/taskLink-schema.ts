import {SchemaObject} from '@loopback/rest';

export const TaskLinkSchema: SchemaObject = {
  type: 'object',
  required: ['parentId', 'taskId'],
  properties: {
    parentId: {
      type: 'string',
    },
    taskId: {
      type: 'string',
    },
  },
};

export const TaskLinkRequestBody = {
  description: 'The input of creating task link',
  required: true,
  content: {
    'application/json': {schema: TaskLinkSchema},
  },
};