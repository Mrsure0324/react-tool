import { mysqlParser } from '../sql-parser';

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
console.log('self',self)

ctx.onmessage = event => {
  ctx.postMessage(mysqlParser(event.data.text, event.data.index));
};

export default null as any;
