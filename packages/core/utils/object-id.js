
/**
 * Machine id.
 *
 * Create a random 3-byte value (i.e. unique for this
 * process). Other drivers use a md5 of the machine id here, but
 * that would mean an asyc call to gethostname, so we don't bother.
 * @ignore
 */
const MACHINE_ID = new Uint8Array(3);
let inc = ~~(Math.random() * 0xffffff);

crypto.getRandomValues(MACHINE_ID);

/**
 * Generate a compatible Mongo ObjectID.
 * @returns 
 */
export const id = () => {
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
  buffer[6] = MACHINE_ID[0];
  buffer[5] = MACHINE_ID[1];
  buffer[4] = MACHINE_ID[2];
  // Encode pid
  buffer[8] = pid & 0xff;
  buffer[7] = (pid >> 8) & 0xff;
  // Encode index
  buffer[11] = inc & 0xff;
  buffer[10] = (inc >> 8) & 0xff;
  buffer[9] = (inc >> 16) & 0xff;

  // increment
  inc += 1;

  return Array.from(
    buffer, 
    i => i.toString(16).padStart(2, "0")
  ).join("");
}
