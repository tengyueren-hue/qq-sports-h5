import {staticAPI} from './static-api.js';
// The local preview server is authoritative for the date, fixed content and daily draw.
// In QQ production this API must be backed by the authenticated QQ user and real step data.
export async function fetchState(path = '/api/fortune', body) {
  return staticAPI(path, body);
}

export async function todayRecord() { return (await fetchState()).fortune; }
export function stepMessage(steps, goal) {
  if (!Number.isInteger(steps) || steps < 0) return '愿你今天走的每一步，都有好事发生。';
  if (steps === 0) return '今天的好运，等你迈出第一步。';
  if (Number.isInteger(goal) && goal > 0) {
    if (steps > goal) return '今天的你状态满满，好运继续加倍！';
    if (steps === goal) return '今日目标已达成，好运与你一路同行！';
  }
  return `今天已走${steps.toLocaleString('zh-CN')}步，每一步都算数。`;
}
