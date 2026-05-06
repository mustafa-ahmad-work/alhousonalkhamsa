const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * هذا الـ Plugin يقوم بحذف أي صلاحيات حساسة من AndroidManifest.xml النهائي
 * باستخدام أمر tools:node="remove" الذي يعمل حتى لو حاولت مكتبة خارجية إضافتها.
 * المصدر: https://developer.android.com/studio/build/manifest-merge
 */

const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.READ_CALENDAR',
  'android.permission.WRITE_CALENDAR',
  'android.permission.READ_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.SEND_SMS',
  'android.permission.READ_PHONE_STATE',
  'android.permission.CALL_PHONE',
  'android.permission.GET_ACCOUNTS',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
];

module.exports = function withStripSensitivePermissions(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // إضافة xmlns:tools إذا لم يكن موجوداً — ضروري لعمل tools:node
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    // حذف أي صلاحية موجودة مسبقاً من القائمة
    androidManifest['uses-permission'] = androidManifest['uses-permission'].filter(
      (perm) => !PERMISSIONS_TO_REMOVE.includes(perm.$?.['android:name'])
    );

    // إضافة أمر الحذف الصريح لكل صلاحية — يمنع أي مكتبة من إعادة إضافتها
    PERMISSIONS_TO_REMOVE.forEach((permissionName) => {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': permissionName,
          'tools:node': 'remove',
        },
      });
    });

    return config;
  });
};
