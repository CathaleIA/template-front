import snowflake from 'snowflake-sdk';

interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  warehouse: string;
  database: string;
  schema: string;
  role?: string;
}

function getConfig(): SnowflakeConfig {
  const config = {
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    role: process.env.SNOWFLAKE_ROLE,
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'role' && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Snowflake configuration: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }

  return config as SnowflakeConfig;
}

export async function executeQuery<T = any>(
  sqlText: string,
  binds?: any[]
): Promise<T[]> {
  const config = getConfig();
  
  const connection = snowflake.createConnection({
    account: config.account,
    username: config.username,
    password: config.password,
    warehouse: config.warehouse,
    database: config.database,
    schema: config.schema,
    role: config.role,
    clientSessionKeepAlive: true,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        console.error('❌ Error connecting to Snowflake:', err.message);
        reject(err);
        return;
      }

      conn.execute({
        sqlText,
        binds,
        complete: (err, stmt, rows) => {
          // Always destroy connection after query completes
          conn.destroy((destroyErr) => {
            if (destroyErr) {
              console.error('Error destroying connection:', destroyErr);
            }
          });

          if (err) {
            console.error('❌ Query error:', err.message);
            reject(err);
          } else {
            resolve((rows || []) as T[]);
          }
        },
      });
    });
  });
}

export async function closeConnection(): Promise<void> {
  // No-op as connections are now managed per-request
  return Promise.resolve();
}
