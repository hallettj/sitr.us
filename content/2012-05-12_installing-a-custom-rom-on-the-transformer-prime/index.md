+++
title = "Installing a custom ROM on the Transformer Prime: A start-to-finish guide"
date = 2012-05-12
updated = 2012-05-19
path = "2012/05/12/installing-a-custom-rom-on-the-transformer-prime.html"

[taxonomies]
tags = ["Android"]

[extra]
revisions = [
  { date = 2012-05-19, message = "Added notes on my experience with the new ROM since writing this article." }
]
+++

This guide provides step-by-step instructions for installing the [Virtuous Prime][]
community ROM on your Asus Transformer Prime TF201 tablet.  This guide will
be useful to you if you do not have root access to your tablet.

<!-- more -->

Be aware that following the instructions here will void your warranty and
will wipe all of the data on your tablet.  There is also a danger that you
might brick your tablet.  Proceed at your own risk.

So, why would you want to install a custom ROM on your tablet?  In my case
I wanted to gain root access, which allows one to do all sorts of nifty
things.  Community-made ROMS are also often customized to make the Android
experience more pleasant for power users.  And choosing your own ROM means
that you are no longer dependent on the company that sold you your device
to distribute firmware updates in a timely fashion.  But if you are reading
this then you probably already know why you want to install a custom ROM -
so let's get on to the next step.

This guide specifically covers installing [Virtuous Prime][], which is
based on the official Asus firmware.  If you like the features that Asus
provides, like the ability to switch between performance profiles and to
toggle IPS+ mode then this is probably the ROM for you.  Virtuous also adds
some features like root access, the ability to overclock the processors to 1.6 GHz,
and so on.  Note to the Virtuous ROM devs: it is really awesome to have you
all putting in the effort to make the Android experience better for
everybody.  It is especially amazing that you give your ROM away for free.
You are virtuous people indeed!  That said, these folks do accept
[donations][].

[donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DLXKH3V45FFYY

If you would rather get a vanilla Ice Cream Sandwich experience then you
might check out [AOKP][].

[Virtuous Prime]: http://www.virtuousrom.com/p/prime.html
[AOKP]: http://transformerprimeroot.com/transformer-prime-roms/aokp-ics-rom-for-rooted-transformer-prime/

If you just want root access and you do not want to install a custom ROM
then there is a simpler procedure that you can follow using [SparkyRoot][].
The catch is that SparkyRoot does not work in firmware versions v9.4.2.21
or later.  Part of the reason that I went for a custom ROM is that
I upgraded the firmware on my Prime as soon as I got it - so I missed my
shot at using SparkyRoot.  Don't be like me: plan ahead!

[SparkyRoot]: http://forum.xda-developers.com/showthread.php?t=1526487

If you have the newest firmware version [it is possible to downgrade][downgrading]
in order to use SparkyRoot.  I chose to install a custom ROM instead
because it seemed to me to be a safer option.  Be aware that if you follow
the directions here to install a custom ROM you will not be able to use the
downgrade procedure in that link.

[downgrading]: http://forum.xda-developers.com/showthread.php?t=1622628

In brief, here are the steps that we are going to follow:

1. Unlock the bootloader using the official Asus tool.
2. Install ClockworkMod Recovery.
3. Install the Virtuous Prime ROM, using ClockworkMod.

<div style="margin-top:2em"></div>

## Step 1: Unlock the bootloader

I am not completely sure that this step is necessary.  I did not try
installing ClockworkMod Recovery before unlocking.  But even if it is not
necessary, I imagine that there may come a time when I am glad to have an
unlocked bootloader.  You can try skipping this step; at worst nothing will
happen.

The unlocking tool is provided by Asus.  As you will see, Asus makes it
very clear that using the unlock tool will void your warranty.  But on
the upside it will not wipe your data or anything like that.  The only
noticeable change will be that every time you boot up the tablet there
will be a message in the upper-left corner of the screen that says, "The
device is UnLocked".  I assume that is there so that customer service
representatives can see that they are not supposed to help you.

Download the unlock tool directly onto your tablet from [the TF201 support
section][Asus downloads] of the Asus website.  Select "Android" as the OS
and grab the "Unlock Device App" from the "Utilities" section.  The file
that you get is an apk that you will install as an app.

[Asus downloads]: http://support.asus.com/Download.aspx?SLanguage=en&m=Eee+Pad+Transformer+Prime+TF201&p=20&s=16

If you have not done so already, you will have to enable unknown software
sources in your tablet settings.  Go to Settings > Security > Device
Administration and check the box that says "Unknown Sources".

Use your file manager to find the downloaded unlock tool.  It is probably in
`/sdcard/Download/UnLock_Device_App_V6.apk`.  Tap it to install the app.

You will be prompted to confirm your Google account by entering your Google
password.  If you are using two-factor authentication on your Google
account you will have to set up an application-specific password for this.
You can revoke that password after your tablet is unlocked.

Next you will have to agree to a license and acknowledge a warning.
Again, Asus wants to make it really clear that you are about to void
your warranty.

After you agree to everything your tablet will reboot and your bootloader
is now unlocked.


## Step 2: Install ClockworkMod Recovery

ClockworkMod Recovery is a custom recovery image.  The Transformer Prime
comes with a recovery image provided by Asus that lets you do stuff like
manually install OS updates.  But the Asus recovery image will only let you
install updates that are digitally signed by Asus.  To install
a community-made ROM you need a recovery mode that will let you install
unsigned ROMs.  That is what ClockworkMod does.  It also provides extra
features, like the ability to back up and restore your whole OS.

Installing ClockworkMod will probably void your warranty - in case you
somehow got to this point with an intact warranty.  There is also some
danger that you could brick your tablet.  Proceed at your own risk.

These instructions are adapted from
[a guide on TransformerPrimeRoot.com][ClockworkMod guide].  I'm going to
give you the slightly more complicated version that involves downloading
files directly from ClockworkMod and from Google; and I will provide tips
on what to do if the fastboot tool is not able to find your tablet.
I personally appreciate it when I can get files from sources that I know
I can trust.  But if you are not convinced that is necessary then feel free
to check out the TransformerPrimeRoot.com guide.

[ClockworkMod guide]: http://transformerprimeroot.com/transformer-prime-recovery/how-to-install-clockworkmod-recovery-5-8-2-0-on-transformer-prime/

For this step you will need a computer.

Download the latest ClockworkMod Recovery image from
[ClockworkMod's downloads page][ClockworkMod downloads].  As of this
writing the latest version for the Transformer Prime is 5.8.2.0.  According
to TransformerPrimeRoot.com earlier versions can put your device into
a reboot loop (which you can recover from but it is scary when it happens,
I imagine).

[ClockworkMod downloads]: http://www.clockworkmod.com/rommanager

The Touch Recovery image should also work.  It comes with a nicer
touch-based UI.  But the guides that I have read call for the non-touch
version, so that is what I went with.

You will also need the fastboot tool from the Android SDK to install the
recovery image.  [Download the SDK][SDK downloads] from Google and extract
it.  Run the `android` executable in the `tools/` directory to launch the
SDK package manager and use that tool to install the Android SDK
Platform-tools: check the box next to "Android SDK Platform-tools" and
click "Install packages...".  After a few minutes that will add a new
executable, `fastboot`, in the `platform-tools` directory in the Android
SDK package.  You will use the fastboot program to send commands to your
tablet while the tablet is in fastboot mode.

[SDK downloads]: https://developer.android.com/sdk/index.html

Android devices have two boot modes apart from the normal boot-into-the-OS
option: [recovery mode] and [fastboot].  Fastboot is a low-level mode that
is used for flashing firmware.  You can use fastboot to replace the
recovery mode image - which is what we will be doing to install
ClockworkMod.  And you can use recovery mode to install a new OS.
Likewise, if your OS breaks you can fix it from recovery mode and if
recovery mode breaks you may be able to fix it from fastboot.  What happens
if fastboot breaks?  Try not to let that happen!  The Android devs have not
yet provided us with an extra-fast-boot.

[fastboot]: http://www.androidcentral.com/android-z-what-fastboot
[recovery mode]: http://www.androidcentral.com/what-recovery-android-z

If you are on Windows then you will have to [install a USB driver][] before
proceeding.  Linux and Mac users do not need any special drivers.

[install a USB driver]: http://transformerprimeroot.com/transformer-prime-root/how-to-install-transformer-prime-usb-drivers-on-windows/

Make sure that your battery is charged to at least 50%.  Bad things will
happen if your battery dies while you are flashing a recovery image.

Boot your tablet into fastboot by holding down the power and volume-down
buttons.  The tablet will power off and reboot.  Wait until you see several
lines of white text in the upper-left corner of the screen, then let go of
the power and volume buttons.  Then wait for five seconds and you will see
the fastboot options.

Press volume-down to highlight the USB icon and then press volume-up to
select it.  You have ten seconds to do this - after that the tablet will
cold-boot Android instead.  If that happens, don't worry.  Just start over
by holding down the power and volume-down buttons.

Plug the tablet into your computer using the USB cable that came with your
tablet.

On your computer open a terminal.  Assuming that you have the
ClockworkMod Recovery image and the extracted Android SDK in the same
downloads folder, cd to that folder.  Run this fastboot command to make
sure that your computer is talking to your tablet:

    android-sdk_r18/platform-tools/fastboot -i 0x0b05

The `-i 0x0b05` part tells fastboot which USB device to communicate with.
The number `0b05` is the Asus vendor id for USB interfaces.  If you want to
double-check that vendor id you can use the `lsusb` command on Linux.  On
my machine the output includes a line that looks like this:

    Bus 002 Device 018: ID 0b05:4d01 ASUSTek Computer, Inc.

The vendor id is the portion of the ID before the colon.

Anyway, if the fastboot command that you ran worked you should see output that
looks like this:

    finished. total time: 1336881627.143s

On the other hand, if you see a message that says `< waiting for device >`,
and you wait a minute or two and nothing happens, then hit Ctrl-c to
cancel.  If you are in Linux you can fix this problem by creating a udev
rule.  Create a new file, `/etc/udev/rules.d/99-android.rules` and add this
line to it:

    SUBSYSTEM=="usb", ATTRS{idVendor}=="0b05", MODE="0666", OWNER="yourusername"

But make sure to replace "yourusername" with your user name.  Then
restart udev with this command:

    sudo restart udev

Now try the fastboot command again.

Ok, is fastboot talking to your tablet?  Now for the next step: flashing
ClockworkMod.

I recommend checking the md5 checksum on the ClockworkMod Recovery image
to make sure that it has not been corrupted.  On Linux you can use this
command to do that:

    md5sum recovery-clockwork-5.8.2.0-tf201.img

It appears that ClockworkMod does not list md5 checksums on its
downloads page.  But here is the checksum that I got for version 5.8.2.0:

    08009bd8fa324116e71982945390cdde

You should proceed only if the checksums match.

Run this command - and again make sure that the paths match the
locations of the fastboot and ClockworkMod Recovery image files:

    android-sdk_r18/platform-tools/fastboot -i 0x0b05 flash recovery recovery-clockwork-5.8.2.0-tf201.img 

If all goes well you should see some output like this:

    sending 'recovery' (5378 KB)...
    OKAY [  1.891s]
    writing 'recovery'...
    OKAY [  1.571s]
    finished. total time: 3.462s

Now you have ClockworkMod Recovery installed.


## Step 3: Install the Virtuous Prime ROM

Following the instructions here will wipe everything on your tablet.  And
you will void your warranty - again.  Proceed at your own risk.

There are [instructions on RootzWiki][] for installing Virtuous Prime.  I'm
going to give you the same instructions but with a bit more detail.  But
I recommend reading the information on RootzWiki too as there is a lot
of useful background there.

[instructions on RootzWiki]: http://rootzwiki.com/topic/21125-roms-series300312-virtuous-prime-94221-v1/

Download the latest version of [Virtuous Prime][] directly onto your
tablet.  As of this writing that is Virtuous Prime 9.4.2.21 v1, which is
based on the Transformer Prime v9.4.2.21 firmware from Asus.  You will get
a zip file - don't unzip it!

Next to the download link there will be an MD5 checksum.  We will refer
back to that in a moment.

Use your file manager to move the zip file,
`virtuous_prime_s_9.4.2.21_v1.zip` from `/sdcard/Download/` to
`/sdcard/`.  I think that this step is superfluous; but it makes me feel
better.

This is optional, but highly recommended: install the free [MD5 Checker][]
app.  You can use this app to check the MD5 checksum of the file that you
downloaded to make sure that it was not corrupted.  Open MD5 Checker, click
on the button labelled "Load File 1", browse to the Virtuous Prime zip
file, and wait for MD5 Checker to compute the file's checksum.  Make sure
that the checksum that you see in MD5 Checker is the same as the one from
the Virtuous Prime downloads page.  If the checksums do not match then do
not proceed!  Download the file again and check the checksum again.

[MD5 Checker]: https://play.google.com/store/apps/details?id=com.fab.md5

Shut down your tablet.  But make sure that your battery is charged to at
least 50% first.  And make sure that the USB cable is unplugged.

Boot into recovery mode by holding both the power and volume-down buttons.
As with fastboot, when you see several lines of white text in the
upper-left corner of the screen let go of both buttons.  But this time
press volume-up right away.  If you do not press volume-up within five
seconds then the tablet will go into fastboot.  If that happens then just
start over by holding the power and volume-down buttons again.

After a moment you should see the ClockworkMod menu.  You can use the
volume-up and volume-down buttons to highlight the different menu options
and the power button to select the option that you want.

Make a backup of your current ROM.  Select "backup and restore", then
"backup".  This will create a timestamped backup directory on your tablet
under `/sdcard/clockwork/backup/`.

There is a lot of information on backing up and restoring your tablet
[here][backing up].

[backing up]: http://www.androidpolice.com/2010/04/16/complete-guide-how-to-fully-back-up-and-restore-your-android-phone-using-nandroid-backup-and-clockworkmod-rom-manager/

The backup process will take a few minutes.  When it is done you will see
the ClockworkMod menu again.

Select "wipe data/factory reset".  According to RootzWiki this step is
optional, but is highly recommended.  You will have to complete an
elaborate confirmation step to start the wipe.

Once all of your data has been wiped, select "install zip from sdcard",
then "choose zip from sdcard".  Browse to the Virtuous Prime ROM and select
it.  And confirm that you are really sure about this.

You will be taken through a guided install process in which you will be
prompted to choose between Typical, Complete, or Minimal install modes.
There is a list of the differences between the three modes on
[RootzWiki][instructions on RootzWiki].

When the installer is finished your tablet will reboot and you are done!
Congratulations!  Enjoy your new ROM!


## More Resources

There is some useful information collected on [TransformerPrimeRoot.com][].
Much of the information in my guide comes from that site.

[TransformerPrimeRoot.com]: http://transformerprimeroot.com/

If the worst should happen and your tablet becomes a brick, you may still
be able to recover.  Check out the [recovery guide][] on
[XDA-Developers][].

[recovery guide]: http://forum.xda-developers.com/showthread.php?t=1514088
[XDA-Developers]: http://forum.xda-developers.com/


## Update 2012-05-19

After about a week of use, the Virtuous Prime ROM is working very well.
It does everything that the Asus firmware did and more.  But I did run
into some problems that I wanted to report along with some workarounds.

The Hulu Plus app does not work for me anymore.  When I try to play
a video I get this message:

> Streaming Unavailable \[91\]
>
> Sorry, we are unable to stream this video. Please check your Internet
> connection, ensure you have the latest official update for your
> device, and try again.

The Hulu app did work for me before I unlocked my tablet.  There are
[reports that unlocking the bootloader is what causes this problem][reports].
This may not have anything to do with Virtuous Prime directly.

[reports]: http://forum.xda-developers.com/showthread.php?t=1571405

A helpful community member created
[a modified version of the Hulu Plus app][Hulu Plus apk] that does work.
From the first post in that thread you can download and install the
Landscape Mod HuluPlus.apk package.  You will need to enable "Unknown
Sources" to install the package.  Before you install this version
I suggest wiping the data of the original Hulu app and uninstalling it.

The home view in the app is distorted; but the queue view works fine.
This mod is based on a phone version of the original Hulu app rather
than a tablet version.  Video quality seems a bit low - I don't know
whether that is due to my connection or to the app.  With those caveats,
the modified app works great for me.

[Hulu Plus apk]: http://forum.xda-developers.com/showthread.php?t=1449110

Netflix works perfectly.  Hooray for Netflix!

The Amazon Kindle app crashes when I try to open a book.  I have tried
wiping the app's data and reinstalling multiple times.  I have also
tried different books.  And I have confirmed that I am running version 3.5.1.1,
which is the latest version available in the Play Store right now.

I managed to fix the Kindle app by following
[instructions to fix Machinarium][Machinarium fix], which simply
involves installing a missing font.

An alternative workaround is to use the [Cloud Reader][].  Note that the
Cloud Reader will work in [Chrome for Android Beta][], but will refuse
to run in the default Android browser.  You will not be able to install
the extension that allows Cloud Reader to work offline since the mobile
version of Chrome does not support extensions yet.  So you will have to
be connected to the internet to use the Cloud Reader.

[Cloud Reader]: https://read.amazon.com
[Chrome for Android Beta]: https://play.google.com/store/apps/details?id=com.android.chrome

Someone on the XDA Developers forum asked whether the game Machinarium
would install under Virtuous Prime.  I tested this and found that the
game will install - but it crashes on startup.  I did not test this game
before installing Virtuous Prime.  All other games that I have tested
have worked fine.

It turns out that the problem with Machinarium is that there is
a missing font in Virtuous Prime.  Specifically the Droid Sans and Droid
Sans Bold fonts are missing.  There is [a fix][Machinarium fix] reported
in the XDA Developers forum.

[Machinarium fix]: http://forum.xda-developers.com/showthread.php?p=26109294#post26109294

So with some digging it seems that I did not encounter any problems that
I could not fix.  Also, having root access to my tablet is excellent.

{{ revisions() }}
