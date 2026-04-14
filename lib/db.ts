import "server-only";
import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        uri: string | null;
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache || { uri: null, conn: null, promise: null };
const DEFAULT_LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/nyanza-sda-church";

const DB_CONNECTION_MESSAGE =
  "Ntitwabashije kugera kuri database. Gerageza indi internet cyangwa wongere ugerageze nyuma gato.";

function getDbErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return DB_CONNECTION_MESSAGE;
  }

  const rawMessage = `${error.name} ${error.message}`;
  if (
    /SSL routines|tlsv1 alert internal error|MongooseServerSelectionError|MongoNetworkError|ReplicaSetNoPrimary|Server selection timed out|querySrv|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(
      rawMessage
    )
  ) {
    return DB_CONNECTION_MESSAGE;
  }

  return error.message;
}

function resetCache() {
  cached.uri = null;
  cached.conn = null;
  cached.promise = null;
  global.mongooseCache = cached;
}

function getMongoUris() {
  const atlasUri = process.env.MONGODB_URI?.trim();
  const localUri =
    process.env.MONGODB_URI_LOCAL?.trim() || DEFAULT_LOCAL_MONGODB_URI;
  const canUseLocalFallback =
    process.env.NODE_ENV !== "production" &&
    process.env.MONGODB_DEV_FALLBACK !== "false";

  if (atlasUri) {
    return {
      primaryUri: atlasUri,
      fallbackUri: canUseLocalFallback ? localUri : null
    };
  }

  if (canUseLocalFallback) {
    return {
      primaryUri: localUri,
      fallbackUri: null
    };
  }

  throw new Error(
    "MONGODB_URI ntiboneka. Shyira iri zina muri .env.local mbere yo gukomeza."
  );
}

async function connectWithUri(mongoUri: string) {
  if (cached.conn && cached.uri === mongoUri) {
    return cached.conn;
  }

  if (cached.uri !== mongoUri) {
    resetCache();
    cached.uri = mongoUri;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 15000
      })
      .catch((error) => {
        resetCache();
        console.error("MongoDB connection error:", error);
        throw new Error(getDbErrorMessage(error));
      });
  }

  try {
    cached.conn = await cached.promise;
    global.mongooseCache = cached;
    return cached.conn;
  } catch (error) {
    resetCache();
    throw error;
  }
}

export async function connectDb() {
  const { primaryUri, fallbackUri } = getMongoUris();

  try {
    return await connectWithUri(primaryUri);
  } catch (error) {
    if (!fallbackUri || fallbackUri === primaryUri) {
      throw error;
    }

    console.warn("Atlas yanze. Tugerageje local MongoDB muri development.");
    return connectWithUri(fallbackUri);
  }
}
