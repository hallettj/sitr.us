% Rust, its FFI, and PAM
% Jesse Hallett
% March 24, 2015


~~~~ {.rust}
fn double(x: isize) -> isize {
    x * 2
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub struct Student {
    name:    String,
    age:     usize,
    courses: Vec<Course>,
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
pub enum Option<T> {
    Some(T),
    None,
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub enum Option<T> {
    Some(T),
    None,
}
~~~~~~~~~~~~~~~~~~~~~~

~~~~ {.rust}
fn double(x: Option<isize>) -> Option<isize> {
    match x {
        Some(n) => Some(n * 2),
        None    => None,
    }
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
impl <T> Option<T> {
    pub fn map<U, F>(self, f: F) -> Option<U>
        where F: FnOnce(T) -> U
    {
        match self {
            Some(n) => Some(f(n)),
            None    => None,
        }
    }
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
fn double(x: Option<isize>) -> Option<isize> {
    x.map(|n| n * 2)
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
fn double(x: Option<isize>) -> Option<isize> {
    Option::map(x, |n| n * 2)
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub enum Result<T,E> {
    Ok(T),
    Err(E),
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub trait Wrapper<T> {
    pub fn unwrap(self) -> T;
}
~~~~~~~~~~~~~~~~~~~~~~

. . .


~~~~ {.rust}
impl <T> Wrapper<T> for Option<T> {
    fn unwrap(self) -> T {
        match self {
            Some(x) => x,
            None => panic!("called `Option::unwrap()` on a `None` value"),
        }
    }
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
impl <T,E> Wrapper<T> for Result<T,E> {
    fn unwrap(self) -> T {
        match self {
            Ok(x) => x,
            Err(_) => panic!("called `Result::unwrap()` on an `Err` value"),
        }
    }
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
let opt = Some(3);
let res: Result<u8,String> = Ok(4);

println!("{}", opt.unwrap());
println!("{}", res.unwrap());
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
println!("{}", Wrapper::unwrap(opt));
println!("{}", Wrapper::unwrap(res));
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use std::num::Int;

fn square<T: Int>(x: Option<T>) -> Option<T> {
    x.map(|n| n * n)
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use std::io;

fn main() {
    let mut buf = String::new();
    match io::stdin().read_line(&mut buf) {
        Ok(bytes_read) => print!("{}: {}", bytes_read, buf),
        Err(msg)       => print!("{}", msg),
    }
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~
$ rustc echo.rs && ./echo
hello
6: hello
~~~~~~~~~~~~~~~~~~~~~~

---


~~~~ {.c}
#include <stdio.h>
#include <stdlib.h>

int main()
{
    char *buf;
	size_t n = 1024;
	buf = malloc(n);
	if (getline(&buf, &n, stdin) == -1) {
        printf("No line\n");
	} else {
        printf("%i: %s", n, buf);
	}
	free(buf);
    return 0;
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use std::io::stdin;

fn main() {
    let mut s: &str;

    {
        let mut buf = String::new();
        let _ = stdin().read_line(&mut buf);
        s = &buf;
    }

    print!("{}", s);
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~
$ rustc echo.rs
echo.rs:9:14: 9:17 error: `buf` does not live long enough
echo.rs:9         s = &buf;
                       ^~~
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use std::io::stdin;
use std::mem::drop;

fn main() {
    let mut s: &str;

    {
        let mut buf = String::new();
        let _ = stdin().read_line(&mut buf);
        s = &buf;
        drop(buf);  // implicit
    }

    print!("{}", s);
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
#[inline]
#[stable(feature = "rust1", since = "1.0.0")]
pub fn drop<T>(_x: T) { }
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
fn exclam(s: &mut String) {
    s.push_str("!!");
}

pub fn main() {
    let mut s = "foo".to_string();
    exclam(&mut s);
    println!("{}", s);
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
fn exclam(mut s: String) {
    s.push_str("!!");
}

pub fn main() {
    let mut s = "foo".to_string();
    exclam(s);
    println!("{}", s);
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~
$ rustc exclam.rs
exclam.rs:8:20: 8:21 error: use of moved value: `s`
exclam.rs:8     println!("{}", s);
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
fn exclam(mut s: String) -> String {
    s.push_str("!!");
    s
}

pub fn main() {
    let s = "foo".to_string();
    let s_ = exclam(s);
    println!("{}", s_);
}
~~~~~~~~~~~~~~~~~~~~~~

---

![QR code login challenge](https://cloud.githubusercontent.com/assets/9622/6606788/53a4a684-c7f7-11e4-9164-9a90bb93d343.png)

---

~~~~ {.c}
#define PAM_SM_AUTH
#include <security/pam_modules.h>

PAM_EXTERN int pam_sm_authenticate(pam_handle_t *pamh,
                                   int flags,
                                   int argc,
                                   const char **argv);
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.rust}
#[no_mangle]
pub extern fn pam_sm_authenticate(pamh: &module::PamHandleT,
                                  flags: PamFlag,
                                  argc: c_int,
								  argv: *const *const c_char
                                  ) -> PamResultCode;
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use libc::{c_char};

pub enum PamHandleT {}
pub enum PamDataT {}

#[link(name = "pam")]
extern {
    fn pam_get_data(pamh: *const PamHandleT,
                    module_data_name: *const c_char,
                    data: & *mut PamDataT,
                    ) -> PamResultCode;
    fn pam_get_user(pamh: *const PamHandleT,
                    user: & *mut c_char,
                    prompt: *const c_char,
                    ) -> PamResultCode;
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
use libc::{c_int, c_uint};

pub type PamItemType = c_int;

// see /usr/include/security/_pam_types.h
pub const PAM_SERVICE:      PamItemType =  1;   /* The service name */
pub const PAM_USER:         PamItemType =  2;   /* The user name */
pub const PAM_TTY:          PamItemType =  3;   /* The tty name */
pub const PAM_RHOST:        PamItemType =  4;   /* The remote host name */
pub const PAM_CONV:         PamItemType =  5;   /* The pam_conv structure */
pub const PAM_AUTHTOK:      PamItemType =  6;   /* The authentication token (password) */
pub const PAM_OLDAUTHTOK:   PamItemType =  7;   /* The old authentication token */
pub const PAM_RUSER:        PamItemType =  8;   /* The remote user name */
pub const PAM_USER_PROMPT:  PamItemType =  9;   /* the prompt for getting a username */
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub trait PamItem {
    fn item_type(_: Option<Self>) -> PamItemType;
}

enum PamItemT {}

pub fn get_item<'a, T: PamItem>(pamh: &'a PamHandleT) -> PamResult<&'a T> {
    let ptr: *mut PamItemT = ptr::null_mut();
    let (res, item) = unsafe {
        let r = pam_get_item(pamh, PamItem::item_type(None::<T>), &ptr);
        let raw_item: &PamItemT = ptr.as_ref().unwrap();
        let t: &T = mem::transmute(raw_item);
        (r, t)
    };
    if constants::PAM_SUCCESS == res { Ok(item) } else { Err(res) }
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
fn substr<'a>(s: &'a str, until: u32) -> &'a str;
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
fn substr(s: &str, until: u32) -> &str;
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
pub fn send_request(/* ... */) -> Result<Json, QErr> {
    Question::new(key_id, secret, method, params).map_err(QErr::EncoderError)
    .and_then(|req| {
        let mut client = Client::new();
        let js = json::encode(&req).unwrap();
        client.post(api_url).body(js.as_slice()).send().map_err(QErr::HttpError)
    })
    .and_then(|mut res| {
        Json::from_reader(&mut res).map_err(QErr::ParserError)
    })
    .and_then(|json| {
        match protocol::error_response(&json.clone()) {
            Some(errs) => Err(QErr::ErrorResponse(errs.clone())),
            None       => Ok(json),
        }
    })}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
#[no_mangle]
pub extern fn pam_sm_authenticate(pamh: &module::PamHandleT, flags: PamFlag,
                                  argc: c_int, argv: *const *const c_char
                                  ) -> PamResultCode {
    let args = unsafe { translate_args(argc, argv) };
    let decision = mdo! {
        user   =<< module::get_user(pamh, None).map_err(AErr::PamResult);
        config =<< Config::build(&user, &args).map_err(AErr::ConfigError);
        conv   =<< module::get_item::<PamConv>(pamh).map_err(AErr::PamResult);
        login  =<< authenticate(&config, &user, &conv);
        ign show_info(conv, flags, &format!("Hello, {}", login.user_display));
        ret Ok(constants::PAM_SUCCESS)
    };
    decision.unwrap_or_else(|e| { show_err(pamh, &e); error_code(&e) })
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.rust}
mdo! {
    x =<< exp1;
    y =<< exp2;
    z =<< exp3;
    ret Ok(x, y, z)
}
~~~~~~~~~~~~~~~~~~~~~~

~~~~ {.rust}
exp1.and_then(|x| {
    exp2.and_then(|y| {
        exp3.and_then(|z| {
            Ok(x, y, z)
        })
    })
})
~~~~~~~~~~~~~~~~~~~~~~

---

## Code

<dl>
    <dt>toznyauth_pam</dt>
    <dd>https://github.com/tozny/toznyauth-pam</dd>
    <dt>sdk-rust</dt>
    <dd>https://github.com/tozny/sdk-rust</dd>
    <dd>crate: tozny_auth</dd>
    <dt>rust-pam</dt>
    <dd>https://github.com/tozny/rust-pam</dd>
    <dd>crate: pam</dd>
</dl>

---

## References

- [The Rust Programming Language][rust-book]
- [An alternative introduction to Rust][rust-alternate]
- [The Linux-PAM Module Writers' Guide][pam-guide]

[rust-book]: https://doc.rust-lang.org/book/
[rust-alternate]: http://words.steveklabnik.com/a-new-introduction-to-rust
[pam-guide]: http://www.linux-pam.org/Linux-PAM-html/Linux-PAM_MWG.html
