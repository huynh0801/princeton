const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createSheetFactory() {
  function createSheet(name, byName) {
    const state = { name, rows: [] };
    const sheet = {
      getName: () => state.name,
      setName: (newName) => {
        if (byName && byName.get(state.name) === sheet) byName.delete(state.name);
        state.name = newName;
        if (byName) byName.set(newName, sheet);
      },
      getLastRow: () => state.rows.length,
      getLastColumn: () => (state.rows.length ? Math.max(...state.rows.map((row) => row.length)) : 0),
      appendRow: (row) => state.rows.push(row.slice()),
      getRows: () => state.rows.map((row) => row.slice()),
      setFrozenRows: () => {},
      setColumnWidth: () => {},
      getRange: (row, col, numRows, numCols) => ({
        setFontWeight: () => {},
        setBackground: () => {},
        setFontColor: () => {},
        setHorizontalAlignment: () => {},
        setValues: (values) => {
          for (let i = 0; i < values.length; i++) {
            state.rows[row - 1 + i] = values[i].slice();
          }
        },
        getValues: () => state.rows.slice(row - 1, row - 1 + numRows).map((item) => item.slice())
      })
    };
    return sheet;
  }

  const byName = new Map();
  const defaultSheet = createSheet('Sheet1', byName);
  byName.set('Sheet1', defaultSheet);
  let active = defaultSheet;

  const spreadsheet = {
    getActiveSheet: () => active,
    getSheetByName: (name) => byName.get(name) || null,
    insertSheet: (name) => {
      const sheet = createSheet(name, byName);
      byName.set(name, sheet);
      return sheet;
    }
  };

  return {
    spreadsheet,
    getSheet: (name) => byName.get(name) || null,
    getSheetNames: () => Array.from(byName.keys())
  };
}

function createSandbox(harness) {
  const sandbox = {
    SpreadsheetApp: { getActiveSpreadsheet: () => harness.spreadsheet },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => null })
    },
    CacheService: {
      getScriptCache: () => ({
        get: () => null,
        put: () => {}
      })
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        releaseLock: () => {}
      })
    },
    Utilities: {
      formatDate: () => '06/11/2026 09:00:00'
    },
    ContentService: {
      createTextOutput: (text) => ({
        setMimeType: function setMimeType(type) {
          this.mimeType = type;
          return this;
        }
      }),
      MimeType: { JSON: 'application/json', TEXT: 'text/plain' }
    },
    console
  };

  vm.createContext(sandbox);
  const script = fs.readFileSync(path.join(__dirname, '../google-apps-script.js'), 'utf8');
  vm.runInContext(script, sandbox, { filename: 'google-apps-script.js' });
  return sandbox;
}

test('Unified Google Apps Script Routing', async (t) => {
  await t.test('parent lead is written to the "Phụ Huynh" tab', () => {
    const harness = createSheetFactory();
    const sandbox = createSandbox(harness);

    sandbox.doPost({
      parameter: {
        formType: 'Phụ Huynh',
        name: 'Nguyen Van An',
        phone: '0988284799',
        childAge: '3-4 tuổi',
        email: 'parent@example.com',
        campus: 'Princeton Academy Ecopark Hải Phòng',
        notes: 'Muốn tham quan cuối tuần'
      }
    });

    const sheet = harness.getSheet('Phụ Huynh');
    assert.ok(sheet, 'Must create the parent tab');
    const rows = sheet.getRows();
    assert.strictEqual(rows.length, 2, 'Header + 1 data row');
    assert.deepStrictEqual(Array.from(rows[0]), [
      'Thời Gian Gửi',
      'Họ & Tên Phụ Huynh',
      'Số Điện Thoại',
      'Độ Tuổi Bé',
      'Email Liên Hệ',
      'Cơ Sở Quan Tâm',
      'Ghi Chú Gửi Trường'
    ]);
    assert.strictEqual(rows[1][1], 'Nguyen Van An');
    assert.strictEqual(rows[1][2], '0988284799');
    assert.strictEqual(rows[1][5], 'Princeton Academy Ecopark Hải Phòng');
    assert.strictEqual(harness.getSheet('Đối Tác'), null, 'Must not create partner tab');
  });

  await t.test('partner lead is written to the "Đối Tác" tab', () => {
    const harness = createSheetFactory();
    const sandbox = createSandbox(harness);

    sandbox.doPost({
      parameter: {
        formType: 'Đối Tác',
        name: 'Tran Quoc Huy',
        phone: '0988284799',
        province: 'Đà Nẵng',
        model: 'Mô hình Standard',
        budget: '3-5 tỷ',
        email: 'partner@example.com',
        notes: 'Đăng ký từ Hero Form'
      }
    });

    const sheet = harness.getSheet('Đối Tác');
    assert.ok(sheet, 'Must create the partner tab');
    const rows = sheet.getRows();
    assert.strictEqual(rows.length, 2, 'Header + 1 data row');
    assert.deepStrictEqual(Array.from(rows[0]), [
      'Thời Gian Gửi',
      'Họ & Tên Nhà Đầu Tư',
      'Số Điện Thoại',
      'Tỉnh / Thành Phố',
      'Mô Hình Quan Tâm',
      'Ngân Sách Dự Kiến',
      'Email',
      'Ghi Chú'
    ]);
    assert.strictEqual(rows[1][1], 'Tran Quoc Huy');
    assert.strictEqual(rows[1][3], 'Đà Nẵng');
    assert.strictEqual(rows[1][4], 'Mô hình Standard');
    assert.strictEqual(rows[1][5], '3-5 tỷ');
    assert.strictEqual(harness.getSheet('Phụ Huynh'), null, 'Must not create parent tab');
  });

  await t.test('honeypot submissions are silently ignored', () => {
    const harness = createSheetFactory();
    const sandbox = createSandbox(harness);

    sandbox.doPost({
      parameter: {
        formType: 'Đối Tác',
        name: 'Spam Bot',
        phone: '0988284799',
        _hp_company: 'filled by bot'
      }
    });

    assert.strictEqual(harness.getSheet('Đối Tác'), null, 'Must not create partner tab');
    assert.strictEqual(harness.getSheet('Phụ Huynh'), null, 'Must not create parent tab');
  });

  await t.test('setupSheets creates both tabs with headers', () => {
    const harness = createSheetFactory();
    const sandbox = createSandbox(harness);

    sandbox.setupSheets();

    const parent = harness.getSheet('Phụ Huynh');
    const partner = harness.getSheet('Đối Tác');
    assert.ok(parent, 'Parent tab must exist');
    assert.ok(partner, 'Partner tab must exist');
    assert.strictEqual(parent.getRows().length, 1);
    assert.strictEqual(partner.getRows().length, 1);
  });
});
