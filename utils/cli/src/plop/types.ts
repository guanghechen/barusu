import nodePlop from 'node-plop'


export type NodePlopAPI = ReturnType<typeof nodePlop>


export interface PlopActionHooksChanges {
  type: string
  path: string
}


export interface PlopActionHooksFailures {
  type: string
  path: string
  error: string
  message: string
}
