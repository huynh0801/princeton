const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const checks = [
      'id="main-header"',
      'id="header-logo"',
      '03 Trụ Cột',
      'CT PEAK & ECT',
      'Đối Tác Đánh Giá',
      'Đặc Quyền Hợp Tác',
      '10 Cơ Sở',
      'whitespace-nowrap'
    ];
    let allFound = true;
    checks.forEach(t => {
      const found = data.includes(t);
      console.log((found ? '✅' : '❌') + ' ' + t);
      if (!found) allFound = false;
    });

    const headerMatch = data.match(/<header id="main-header"[\s\S]*?<\/header>/);
    if (headerMatch) {
      const headerContent = headerMatch[0];
      const hasVeChungToi = headerContent.includes('Về Chúng Tôi');
      console.log((!hasVeChungToi ? '✅' : '❌') + ' "Về Chúng Tôi" removed from header');
      if (hasVeChungToi) allFound = false;
    } else {
      console.log('❌ Could not find header element');
      allFound = false;
    }

    if (allFound) {
      console.log('\n🌟 ALL HEADER CRITERIA VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
});
