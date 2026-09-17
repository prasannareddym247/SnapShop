const sql = require('mssql/msnodesqlv8');
(async () => {
  try {
    const pool = await sql.connect({
      server: 'DESKTOP-ONLKUI7\\SQLEXPRESS',
      database: 'SnapShop',
      options: { trustedConnection: true }
    });
    await pool.request().query("UPDATE Users SET EmailVerified = 1 WHERE Email = 'test1@snapshop.com'");
    console.log('Updated EmailVerified = 1 for test1@snapshop.com');
    const result = await pool.request().query("SELECT Email, EmailVerified FROM Users WHERE Email = 'test1@snapshop.com'");
    console.log('Result:', result.recordset[0]);
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', JSON.stringify({ message: err.message, code: err.code, stack: err.stack }));
    process.exit(1);
  }
})();
