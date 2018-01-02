const log = (x, y, fatal = false) => {
  console.log(`[${x}] ${y}`);
  if (fatal) {
    process.exit();
  }
};

export default log;
