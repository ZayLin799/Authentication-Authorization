function generateOTP() {
  return Math.floor(Math.random() * 9000) + 1000;
}
function getTodayDate() {
  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  return dateTime;
}
module.exports = {
  generateOTP,
  getTodayDate,
};
