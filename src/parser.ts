import { Record, int } from 'neo4j-driver';

function isPrimitive(object: any) {
  return typeof object !== 'object';
}

function isInt(object: any) {
  return object.high !== undefined && object.low !== undefined;
}

function isArray(object: any) {
  return Array.isArray(object);
}

function parseRecordEntry(object: any) {
  if (isPrimitive(object) || object === null) {
    return object;
  }

  if (isInt(object)) {
    return int(object).toNumber();
  }

  if (isArray(object)) {
    const { length } = object;
    const newArray = new Array(length);
    for (let i = 0; i < length; ++i) {
      newArray[i] = parseRecordEntry(object[i]);
    }
    return newArray;
  }

  object = object.properties || object;
  const newObject: any = {};
  for (const [key, value] of Object.entries(object)) {
    newObject[key] = parseRecordEntry(value);
    delete object[key];
  }
  Object.assign(object, newObject);
  return object;
}

const parser = {
  parseRecord<T>(record: Record): T {
    return parseRecordEntry(record.toObject());
  },
};
export default parser;
