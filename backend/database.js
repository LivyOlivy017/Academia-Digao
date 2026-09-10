import postgres from 'postgres';
const sql = postgres('postgres://root:root@localhost:5432/ACADEMIA');
export default sql;