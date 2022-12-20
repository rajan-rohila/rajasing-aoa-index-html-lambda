import fs from "fs-extra";

fs.copy('napi-v6-linux-glibc-x64', 'node_modules/sqlite3/lib/binding/napi-v6-linux-glibc-x64', function (err) {
  if (err) throw err
  console.log('Successfully renamed - AKA moved!')
})