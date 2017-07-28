---
layout: post
author: Dylan Hart
date: 2016-9-27
title: "Scanning BLE on Android"
subtitle: "BLE Packets and Beacons"
categories: ble android
---

### Getting Started with Scanning

Scanning for devices requires the `BLUETOOTH_ADMIN` and `ACCESS_COURSE_LOCATION` permissions.
Once you have these permissions it's pretty easy to start scanning:

```java
// get ble scanner
BluetoothAdapter btAdapter = BluetoothAdapter.getAdapter();
BluetoothLeScanner bleScanner = btAdapter.getBluetoothLeScanner();

// start the scan
ScanCallback scanCallback = /* todo */;
bleScanner.startScan(scanCallback);
```

The [ScanCallback][1] receives incoming advertising packets in the `onScanResult` method.

[1]: https://developer.android.com/reference/android/bluetooth/le/ScanCallback.html

### Understanding the Advertising Packet Structure

The broadcast data section of [the packet][2] is 31 bytes long and consists of several data sections.

<table class="bordered">
    <tr>
        <th colspan="31">Broadcast Data</th>
    </tr>
    <tr>
        <td colspan="3">Flag Data</td>
        <td colspan="8">Data #1</td>
        <td colspan="10">Data #2</td>
        <td colspan="10">...</td>
    </tr>
    <tr>
        <td>0</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        <td>8</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        <td>16</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        <td>24</td><td></td><td></td><td></td><td></td><td></td><td>30</td>
    </tr>
</table>

Each data segment is layed out according to the following format:

<table class="bordered">
    <tr>
        <th colspan="5">Data Segment</th>
    </tr>
    <tr>
        <td>Length (1 byte)</td>
        <td>Type (1 byte)</td>
        <td colspan="3">Content</td>
    </tr>
    <tr>
        <td>0</td>
        <td>1</td>
        <td>2</td>
        <td>...</td>
        <td>length</td>
    </tr>
</table>

_Note: length does not include the one byte it uses, only the bytes after_

The type of the data segment determines it's content.
A table of types [can be found on the bluetooth website][3].
I will describe type `0xFF - Manufacturer Data` in the following sections.
Some of the types like `Device Local Name` are already parsed by the Android API.

_Note: 16 bit numbers tend to be represented in little endian_

There are two separate advertising packets that are sent: the normal broadcast packet that is sent all the time and the scan response packet that is sent when the device is scanned.
Each packet has 31 bytes to advertise data.

[2]: http://www.ti.com/lit/an/swra475/swra475.pdf
[3]: https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile

### Implementing ScanCallback

The [ScanRecord][4] contains the data described above.
The Android API automatically concatentates the scan result packets data to the end of the first packet.

```java
class BleCallback extends ScanCallback {
    // called when a beacon is scanned
    public void onScanResult(int callbackType, ScanResult result) {
        // the broadcast data from both packets
        ScanRecord record = result.getScanRecord();

        // the ScanRecord class provides some methods to
        // access common data.

        // for example: (0x004c is Apple's designated identifier)
        byte[] appleData = record.getManufacturerSpecificData(0x004c);
        if (appleData != null) {
            // parse the data
        }

    }
}
```

[4]: https://developer.android.com/reference/android/bluetooth/le/ScanRecord.html

### Example: Parsing iBeacons

Once we have the data we can it!
The following will describe parsing the iBeacon advertising data.

<table class="bordered">
    <thead>
        <tr>
            <th colspan="27">iBeacon Data Segment</th>
        </tr>
        <tr>
            <th>Length</th>
            <th>Type</th>
            <th colspan="2">Company</th>
            <th colspan="2">Data Type</th>
            <th colspan="16">UUID</th>
            <th colspan="2">Major</th>
            <th colspan="2">Minor</th>
            <th>Tx Power</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>26</td>
            <td>0xFF</td>
            <td colspan="2">0x4c00</td>
            <td colspan="2">0x0215</td>
            <td colspan="16">{uuid bytes}</td>
            <td colspan="2">{major number}</td>
            <td colspan="2">{minor number}</td>
            <td colspan="1">{tx power}</td>
        </tr>
        <tr>
            <td>0</td>
            <td>1</td>
            <td>2</td><td></td>
            <td>4</td><td></td>
            <td>6</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            <td>22</td><td></td>
            <td>24</td><td></td>
            <td>26</td>
        </tr>
    </tbody>
</table>
_Source: [kontakt.io](https://support.kontakt.io/hc/en-gb/articles/201492492-iBeacon-advertising-packet-structure)_

Once this format is understood extracting the data is easy!

```java
// note: getManufacturerData() returns a byte array starting
//       at index 4 in the previous table.

// extract UUID
ByteBuffer bb = ByteBuffer.wrap(appleData, 2, 16);
UUID uuid = new UUID(bb.getLong(), bb.getLong());

// extracting the other data is also easy and left as
// an exercise to the reader.

// note: major and minor are in big endian
```

### Conclusion

Scanning for BLE devices and parsing advertising data on Android is quite simple.
I wish you luck on developing your applications!
