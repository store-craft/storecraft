
/**
 * Machine id.
 *
 * Create a random 3-byte value (i.e. unique for this
 * process). Other drivers use a md5 of the machine id here, but
 * that would mean an asyc call to gethostname, so we don't bother.
 * @ignore
 */
// const MACHINE_ID = new Uint8Array(3);
// let inc = ~~(Math.random() * 0xffffff);

// crypto.getRandomValues(MACHINE_ID);

class Machine {
  static MACHINE_ID = new Uint8Array(3);
  static inc = ~~(Math.random() * 0xffffff);
}
/**
 * Generate a compatible Mongo ObjectID as 12 bytes array
 * @returns 
 */
export function id_as_array() {
  const time = ~~(Date.now() / 1000);
  const pid =
      (typeof process === 'undefined' || process.pid === 1
        ? Math.floor(Math.random() * 100000)
        : process.pid) % 0xffff;

  const buffer = new Uint8Array(12);

  buffer[3] = time & 0xff;
  buffer[2] = (time >> 8) & 0xff;
  buffer[1] = (time >> 16) & 0xff;
  buffer[0] = (time >> 24) & 0xff;
  // Encode machine
  buffer[6] = Machine.MACHINE_ID[0];
  buffer[5] = Machine.MACHINE_ID[1];
  buffer[4] = Machine.MACHINE_ID[2];
  // Encode pid
  buffer[8] = pid & 0xff;
  buffer[7] = (pid >> 8) & 0xff;
  // Encode index
  buffer[11] = Machine.inc & 0xff;
  buffer[10] = (Machine.inc >> 8) & 0xff;
  buffer[9] = (Machine.inc >> 16) & 0xff;

  // increment
  Machine.inc += 1;

  return buffer;
}

/**
 * Generate a compatible Mongo ObjectID as 24 HEX string
 * @returns 
 */
export const id = () => {
  return Array.from(
    id_as_array(), 
    i => i.toString(16).padStart(2, "0")
  ).join("");
}
