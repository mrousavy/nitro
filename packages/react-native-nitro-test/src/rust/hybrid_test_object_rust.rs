use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use nitro_test_rust::any_map::AnyMap;
use nitro_test_rust::car::Car;
use nitro_test_rust::core_types_variant::CoreTypesVariant;
use nitro_test_rust::external_object_struct::ExternalObjectStruct;
use nitro_test_rust::hybrid_base_spec::HybridBaseSpec;
use nitro_test_rust::hybrid_child_spec::HybridChildSpec;
use nitro_test_rust::hybrid_some_external_object_spec::HybridSomeExternalObjectSpec;
use nitro_test_rust::hybrid_test_object_rust_spec::HybridTestObjectRustSpec;
use nitro_test_rust::hybrid_test_view_spec::HybridTestViewSpec;
use nitro_test_rust::js_style_struct::JsStyleStruct;
use nitro_test_rust::map_wrapper::MapWrapper;
use nitro_test_rust::named_variant::NamedVariant;
use nitro_test_rust::nitro_buffer::NitroBuffer;
use nitro_test_rust::old_enum::OldEnum;
use nitro_test_rust::optional_callback::OptionalCallback;
use nitro_test_rust::optional_wrapper::OptionalWrapper;
use nitro_test_rust::partial_person::PartialPerson;
use nitro_test_rust::person::Person;
use nitro_test_rust::powertrain::Powertrain;
use nitro_test_rust::string_or_external::StringOrExternal;
use nitro_test_rust::variant____string::Variant____String;
use nitro_test_rust::variant_bool_f64::Variant_bool_f64;
use nitro_test_rust::variant_bool_old_enum::Variant_bool_OldEnum;
use nitro_test_rust::variant_bool_vec_f64__vec_string__string_f64::Variant_bool_Vec_f64__Vec_String__String_f64;
use nitro_test_rust::variant_bool_weird_numbers_enum::Variant_bool_WeirdNumbersEnum;
use nitro_test_rust::variant_std__sync__arc_dyn_hybrid_base_spec__optional_wrapper::Variant_std__sync__Arc_dyn_HybridBaseSpec__OptionalWrapper;
use nitro_test_rust::variant_std__sync__arc_dyn_hybrid_test_object_rust_spec__person::Variant_std__sync__Arc_dyn_HybridTestObjectRustSpec__Person;
use nitro_test_rust::variant_car_person::Variant_Car_Person;
use nitro_test_rust::variant_string_f64::Variant_String_f64;
use nitro_test_rust::weird_numbers_enum::WeirdNumbersEnum;
use nitro_test_rust::wrapped_js_struct::WrappedJsStruct;

pub struct HybridTestObjectRust {
    number: Mutex<f64>,
    bool_val: Mutex<bool>,
    string_val: Mutex<String>,
    int64_val: Mutex<i64>,
    uint64_val: Mutex<u64>,
    optional_string: Mutex<Option<String>>,
    string_or_null: Mutex<Variant____String>,
    optional_array: Mutex<Option<Vec<String>>>,
    optional_hybrid: Mutex<Option<Arc<dyn HybridTestObjectRustSpec>>>,
    optional_enum: Mutex<Option<Powertrain>>,
    optional_old_enum: Mutex<Option<OldEnum>>,
    optional_callback: Mutex<Option<Arc<dyn Fn(f64) + Send + Sync>>>,
    has_boolean_writable: Mutex<bool>,
    is_boolean_writable: Mutex<bool>,
    some_variant: Mutex<Variant_String_f64>,
}

impl HybridTestObjectRust {
    pub fn new() -> Self {
        Self {
            number: Mutex::new(0.0),
            bool_val: Mutex::new(false),
            string_val: Mutex::new(String::new()),
            int64_val: Mutex::new(0),
            uint64_val: Mutex::new(0),
            optional_string: Mutex::new(None),
            string_or_null: Mutex::new(Variant____String::First(())),
            optional_array: Mutex::new(None),
            optional_hybrid: Mutex::new(None),
            optional_enum: Mutex::new(None),
            optional_old_enum: Mutex::new(None),
            optional_callback: Mutex::new(None),
            has_boolean_writable: Mutex::new(false),
            is_boolean_writable: Mutex::new(false),
            some_variant: Mutex::new(Variant_String_f64::Second(0.0)),
        }
    }

    fn calculate_fibonacci(n: f64) -> i64 {
        let n = n as i64;
        if n <= 1 {
            return n;
        }
        let mut a: i64 = 0;
        let mut b: i64 = 1;
        for _ in 2..=n {
            let c = a + b;
            a = b;
            b = c;
        }
        b
    }
}

impl HybridTestObjectRustSpec for HybridTestObjectRust {
    // Properties

    fn this_object(&self) -> Arc<dyn HybridTestObjectRustSpec> {
        Arc::new(HybridTestObjectRust::new())
    }

    fn optional_hybrid(&self) -> Option<Arc<dyn HybridTestObjectRustSpec>> {
        let guard = self.optional_hybrid.lock().unwrap();
        if guard.is_some() {
            Some(Arc::new(HybridTestObjectRust::new()))
        } else {
            None
        }
    }

    fn set_optional_hybrid(&self, value: Option<Arc<dyn HybridTestObjectRustSpec>>) {
        *self.optional_hybrid.lock().unwrap() = value;
    }

    fn number_value(&self) -> f64 {
        *self.number.lock().unwrap()
    }

    fn set_number_value(&self, value: f64) {
        *self.number.lock().unwrap() = value;
    }

    fn bool_value(&self) -> bool {
        *self.bool_val.lock().unwrap()
    }

    fn set_bool_value(&self, value: bool) {
        *self.bool_val.lock().unwrap() = value;
    }

    fn string_value(&self) -> String {
        self.string_val.lock().unwrap().clone()
    }

    fn set_string_value(&self, value: String) {
        *self.string_val.lock().unwrap() = value;
    }

    fn int64_value(&self) -> i64 {
        *self.int64_val.lock().unwrap()
    }

    fn set_int64_value(&self, value: i64) {
        *self.int64_val.lock().unwrap() = value;
    }

    fn uint64_value(&self) -> u64 {
        *self.uint64_val.lock().unwrap()
    }

    fn set_uint64_value(&self, value: u64) {
        *self.uint64_val.lock().unwrap() = value;
    }

    fn null_value(&self) -> () {}

    fn set_null_value(&self, _value: ()) {}

    fn optional_string(&self) -> Option<String> {
        self.optional_string.lock().unwrap().clone()
    }

    fn set_optional_string(&self, value: Option<String>) {
        *self.optional_string.lock().unwrap() = value;
    }

    fn string_or_undefined(&self) -> Option<String> {
        self.optional_string.lock().unwrap().clone()
    }

    fn set_string_or_undefined(&self, value: Option<String>) {
        *self.optional_string.lock().unwrap() = value;
    }

    fn string_or_null(&self) -> Variant____String {
        self.string_or_null.lock().unwrap().clone()
    }

    fn set_string_or_null(&self, value: Variant____String) {
        *self.string_or_null.lock().unwrap() = value;
    }

    fn optional_array(&self) -> Option<Vec<String>> {
        self.optional_array.lock().unwrap().clone()
    }

    fn set_optional_array(&self, value: Option<Vec<String>>) {
        *self.optional_array.lock().unwrap() = value;
    }

    fn optional_enum(&self) -> Option<Powertrain> {
        *self.optional_enum.lock().unwrap()
    }

    fn set_optional_enum(&self, value: Option<Powertrain>) {
        *self.optional_enum.lock().unwrap() = value;
    }

    fn optional_old_enum(&self) -> Option<OldEnum> {
        *self.optional_old_enum.lock().unwrap()
    }

    fn set_optional_old_enum(&self, value: Option<OldEnum>) {
        *self.optional_old_enum.lock().unwrap() = value;
    }

    fn optional_callback(&self) -> Option<Box<dyn Fn(f64) + Send + Sync>> {
        let guard = self.optional_callback.lock().unwrap();
        guard.as_ref().map(|cb| {
            let cb = Arc::clone(cb);
            Box::new(move |v: f64| cb(v)) as Box<dyn Fn(f64) + Send + Sync>
        })
    }

    fn set_optional_callback(&self, value: Option<Box<dyn Fn(f64) + Send + Sync>>) {
        *self.optional_callback.lock().unwrap() = value.map(|f| Arc::from(f) as Arc<dyn Fn(f64) + Send + Sync>);
    }

    fn has_boolean(&self) -> bool {
        false
    }

    fn is_boolean(&self) -> bool {
        false
    }

    fn has_boolean_writable(&self) -> bool {
        *self.has_boolean_writable.lock().unwrap()
    }

    fn set_has_boolean_writable(&self, value: bool) {
        *self.has_boolean_writable.lock().unwrap() = value;
    }

    fn is_boolean_writable(&self) -> bool {
        *self.is_boolean_writable.lock().unwrap()
    }

    fn set_is_boolean_writable(&self, value: bool) {
        *self.is_boolean_writable.lock().unwrap() = value;
    }

    fn some_variant(&self) -> Variant_String_f64 {
        self.some_variant.lock().unwrap().clone()
    }

    fn set_some_variant(&self, value: Variant_String_f64) {
        *self.some_variant.lock().unwrap() = value;
    }

    // Methods

    fn new_test_object(&self) -> Result<Arc<dyn HybridTestObjectRustSpec>, String> {
        Ok(Arc::new(HybridTestObjectRust::new()))
    }

    fn get_variant_hybrid(
        &self,
        variant: Variant_std__sync__Arc_dyn_HybridTestObjectRustSpec__Person,
    ) -> Result<Variant_std__sync__Arc_dyn_HybridTestObjectRustSpec__Person, String> {
        Ok(variant)
    }

    fn simple_func(&self) -> Result<(), String> {
        Ok(())
    }

    fn add_numbers(&self, a: f64, b: f64) -> Result<f64, String> {
        Ok(a + b)
    }

    fn add_strings(&self, a: String, b: String) -> Result<String, String> {
        Ok(format!("{a}{b}"))
    }

    fn multiple_arguments(&self, _num: f64, _str: String, _boo: bool) -> Result<(), String> {
        Ok(())
    }

    fn bounce_null(&self, value: ()) -> Result<(), String> {
        Ok(value)
    }

    fn bounce_strings(&self, array: Vec<String>) -> Result<Vec<String>, String> {
        Ok(array)
    }

    fn bounce_numbers(&self, array: Vec<f64>) -> Result<Vec<f64>, String> {
        Ok(array)
    }

    fn bounce_structs(&self, array: Vec<Person>) -> Result<Vec<Person>, String> {
        Ok(array)
    }

    fn bounce_partial_struct(&self, person: PartialPerson) -> Result<PartialPerson, String> {
        Ok(person)
    }

    fn sum_up_all_passengers(&self, cars: Vec<Car>) -> Result<String, String> {
        let mut parts = Vec::new();
        for car in &cars {
            for passenger in &car.passengers {
                parts.push(format!("{} ({})", passenger.name, passenger.age));
            }
        }
        Ok(parts.join(", "))
    }

    fn bounce_enums(&self, array: Vec<Powertrain>) -> Result<Vec<Powertrain>, String> {
        Ok(array)
    }

    fn complex_enum_callback(
        &self,
        array: Vec<Powertrain>,
        callback: Box<dyn Fn(Vec<Powertrain>) + Send + Sync>,
    ) -> Result<(), String> {
        callback(array);
        Ok(())
    }

    fn bounce_hybrid_objects(
        &self,
        array: Vec<Arc<dyn HybridChildSpec>>,
    ) -> Result<Vec<Arc<dyn HybridChildSpec>>, String> {
        Ok(array)
    }

    fn bounce_functions(
        &self,
        functions: Vec<Box<dyn Fn() + Send + Sync>>,
    ) -> Result<Vec<Box<dyn Fn() + Send + Sync>>, String> {
        Ok(functions)
    }

    fn bounce_maps(&self, maps: Vec<AnyMap>) -> Result<Vec<AnyMap>, String> {
        Ok(maps)
    }

    fn bounce_promises(&self, promises: Vec<f64>) -> Result<Vec<f64>, String> {
        Ok(promises)
    }

    fn bounce_array_buffers(
        &self,
        array_buffers: Vec<NitroBuffer>,
    ) -> Result<Vec<NitroBuffer>, String> {
        Ok(array_buffers)
    }

    fn create_map(&self) -> Result<AnyMap, String> {
        Err("AnyMap cannot be created from Rust (opaque C++ type)".into())
    }

    fn map_roundtrip(&self, map: AnyMap) -> Result<AnyMap, String> {
        Ok(map)
    }

    fn get_map_keys(&self, _map: AnyMap) -> Result<Vec<String>, String> {
        Err("AnyMap keys cannot be read from Rust (opaque C++ type)".into())
    }

    fn merge_maps(&self, _a: AnyMap, _b: AnyMap) -> Result<AnyMap, String> {
        Err("AnyMap cannot be merged from Rust (opaque C++ type)".into())
    }

    fn copy_any_map(&self, _map: AnyMap) -> Result<AnyMap, String> {
        Err("AnyMap cannot be copied from Rust (opaque C++ type)".into())
    }

    fn bounce_map(
        &self,
        map: HashMap<String, Variant_bool_f64>,
    ) -> Result<HashMap<String, Variant_bool_f64>, String> {
        Ok(map)
    }

    fn bounce_simple_map(&self, map: HashMap<String, f64>) -> Result<HashMap<String, f64>, String> {
        Ok(map)
    }

    fn extract_map(&self, map_wrapper: MapWrapper) -> Result<HashMap<String, String>, String> {
        Ok(map_wrapper.map)
    }

    fn func_that_throws(&self) -> Result<f64, String> {
        Err("This function will only work after sacrificing seven lambs!".into())
    }

    fn func_that_throws_before_promise(&self) -> Result<(), String> {
        Err("This function will only work after sacrificing eight lambs!".into())
    }

    fn throw_error(&self, error: String) -> Result<(), String> {
        Err(error)
    }

    fn try_optional_params(
        &self,
        _num: f64,
        _boo: bool,
        str: Option<String>,
    ) -> Result<String, String> {
        Ok(str.unwrap_or_else(|| "value omitted!".into()))
    }

    fn try_middle_param(&self, _num: f64, _boo: Option<bool>, str: String) -> Result<String, String> {
        Ok(str)
    }

    fn try_optional_enum(&self, value: Option<Powertrain>) -> Result<Option<Powertrain>, String> {
        Ok(value)
    }

    fn try_trailing_optional(
        &self,
        _num: f64,
        _str: String,
        boo: Option<bool>,
    ) -> Result<bool, String> {
        Ok(boo.unwrap_or(false))
    }

    fn add1_hour(&self, date: f64) -> Result<f64, String> {
        Ok(date + 3_600_000.0)
    }

    fn current_date(&self) -> Result<f64, String> {
        let millis = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_millis() as f64;
        Ok(millis)
    }

    fn calculate_fibonacci_sync(&self, value: f64) -> Result<i64, String> {
        Ok(Self::calculate_fibonacci(value))
    }

    fn calculate_fibonacci_async(&self, value: f64) -> Result<i64, String> {
        Ok(Self::calculate_fibonacci(value))
    }

    fn wait(&self, seconds: f64) -> Result<(), String> {
        std::thread::sleep(std::time::Duration::from_secs_f64(seconds));
        Ok(())
    }

    fn promise_throws(&self) -> Result<(), String> {
        Err("Promise throws :)".into())
    }

    fn promise_returns_instantly(&self) -> Result<f64, String> {
        Ok(55.0)
    }

    fn promise_returns_instantly_async(&self) -> Result<f64, String> {
        Ok(55.0)
    }

    fn promise_that_resolves_void_instantly(&self) -> Result<(), String> {
        Ok(())
    }

    fn promise_that_resolves_to_undefined(&self) -> Result<Option<f64>, String> {
        Ok(None)
    }

    fn await_and_get_promise(&self, promise: f64) -> Result<f64, String> {
        Ok(promise)
    }

    fn await_and_get_complex_promise(&self, promise: Car) -> Result<Car, String> {
        Ok(promise)
    }

    fn await_promise(&self, _promise: ()) -> Result<(), String> {
        Ok(())
    }

    fn call_callback(&self, callback: Box<dyn Fn() + Send + Sync>) -> Result<(), String> {
        callback();
        Ok(())
    }

    fn call_callback_that_returns_promise_void(
        &self,
        callback: Box<dyn Fn() -> Result<(), String> + Send + Sync>,
    ) -> Result<(), String> {
        callback()
    }

    fn call_all(
        &self,
        first: Box<dyn Fn() + Send + Sync>,
        second: Box<dyn Fn() + Send + Sync>,
        third: Box<dyn Fn() + Send + Sync>,
    ) -> Result<(), String> {
        first();
        second();
        third();
        Ok(())
    }

    fn call_with_optional(
        &self,
        value: Option<f64>,
        callback: Box<dyn Fn(Option<f64>) + Send + Sync>,
    ) -> Result<(), String> {
        callback(value);
        Ok(())
    }

    fn call_sum_up_n_times(
        &self,
        callback: Box<dyn Fn() -> Result<f64, String> + Send + Sync>,
        n: f64,
    ) -> Result<f64, String> {
        let mut result = 0.0;
        for _ in 0..n as usize {
            result += callback()?;
        }
        Ok(result)
    }

    fn callback_async_promise(
        &self,
        callback: Box<dyn Fn() -> Result<f64, String> + Send + Sync>,
    ) -> Result<f64, String> {
        callback()
    }

    fn callback_async_promise_buffer(
        &self,
        callback: Box<dyn Fn() -> Result<NitroBuffer, String> + Send + Sync>,
    ) -> Result<NitroBuffer, String> {
        callback()
    }

    fn get_complex_callback(&self) -> Result<Box<dyn Fn(f64) + Send + Sync>, String> {
        Ok(Box::new(|_val| {}))
    }

    fn two_optional_callbacks(
        &self,
        value: f64,
        first: Option<Box<dyn Fn(f64) + Send + Sync>>,
        second: Option<Box<dyn Fn(String) + Send + Sync>>,
    ) -> Result<(), String> {
        if let Some(f) = first {
            f(value);
        }
        if let Some(s) = second {
            s("Hello!".into());
        }
        Ok(())
    }

    fn error_callback(&self, on_error: Box<dyn Fn(String) + Send + Sync>) -> Result<(), String> {
        on_error("Some Error!".into());
        Ok(())
    }

    fn create_native_callback(
        &self,
        wrapping_js_callback: Box<dyn Fn(f64) + Send + Sync>,
    ) -> Result<Box<dyn Fn(f64) + Send + Sync>, String> {
        Ok(Box::new(move |n| wrapping_js_callback(n)))
    }

    fn get_value_from_js_callback_and_wait(
        &self,
        get_value: Box<dyn Fn() -> Result<f64, String> + Send + Sync>,
    ) -> Result<f64, String> {
        get_value()
    }

    fn get_value_from_js_callback(
        &self,
        callback: Box<dyn Fn() -> Result<String, String> + Send + Sync>,
        and_then_call: Box<dyn Fn(String) + Send + Sync>,
    ) -> Result<(), String> {
        let value = callback()?;
        and_then_call(value);
        Ok(())
    }

    fn get_car(&self) -> Result<Car, String> {
        Ok(Car {
            year: 2018.0,
            make: "Lamborghini".into(),
            model: "Huracan Performante".into(),
            power: 640.0,
            powertrain: Powertrain::Gas,
            driver: None,
            passengers: vec![],
            is_fast: Some(true),
            favourite_track: None,
            performance_scores: vec![100.0, 10.0],
            some_variant: None,
        })
    }

    fn is_car_electric(&self, car: Car) -> Result<bool, String> {
        Ok(car.powertrain == Powertrain::Electric)
    }

    fn get_driver(&self, car: Car) -> Result<Option<Person>, String> {
        Ok(car.driver)
    }

    fn bounce_car(&self, car: Car) -> Result<Car, String> {
        Ok(car)
    }

    fn js_style_object_as_parameters(&self, params: JsStyleStruct) -> Result<(), String> {
        (params.on_changed)(params.value);
        Ok(())
    }

    fn bounce_wrapped_js_style_struct(
        &self,
        value: WrappedJsStruct,
    ) -> Result<WrappedJsStruct, String> {
        Ok(value)
    }

    fn bounce_optional_wrapper(&self, wrapper: OptionalWrapper) -> Result<OptionalWrapper, String> {
        Ok(wrapper)
    }

    fn bounce_optional_callback(
        &self,
        value: OptionalCallback,
    ) -> Result<OptionalCallback, String> {
        Ok(value)
    }

    fn create_array_buffer(&self) -> Result<NitroBuffer, String> {
        let size = 1024 * 1024 * 10; // 10 MB
        let data = vec![0u8; size];
        Ok(NitroBuffer::from_vec(data))
    }

    fn create_array_buffer_from_native_buffer(&self, _copy: bool) -> Result<NitroBuffer, String> {
        let size = 1024 * 1024 * 10; // 10 MB
        let mut data = vec![0u8; size];
        for i in 0..data.len() {
            data[i] = (i % 255) as u8;
        }
        Ok(NitroBuffer::from_vec(data))
    }

    fn copy_buffer(&self, buffer: NitroBuffer) -> Result<NitroBuffer, String> {
        let data = buffer.to_vec();
        Ok(NitroBuffer::from_vec(data))
    }

    fn get_buffer_last_item(&self, buffer: NitroBuffer) -> Result<f64, String> {
        if buffer.len() == 0 {
            return Err("ArrayBuffer's size is 0!".into());
        }
        let data = buffer.to_vec();
        Ok(data[data.len() - 1] as f64)
    }

    fn set_all_values_to(&self, mut buffer: NitroBuffer, value: f64) -> Result<(), String> {
        if buffer.len() == 0 {
            return Err("ArrayBuffer's size is 0!".into());
        }
        let val = value as u8;
        // SAFETY: we have exclusive ownership of this buffer (it was passed by value).
        unsafe {
            let slice = buffer.as_mut_slice();
            slice.fill(val);
        }
        Ok(())
    }

    fn create_array_buffer_async(&self) -> Result<NitroBuffer, String> {
        self.create_array_buffer()
    }

    fn bounce_array_buffer(&self, buffer: NitroBuffer) -> Result<NitroBuffer, String> {
        Ok(buffer)
    }

    fn pass_variant(
        &self,
        either: Variant_bool_Vec_f64__Vec_String__String_f64,
    ) -> Result<Variant_String_f64, String> {
        match either {
            Variant_bool_Vec_f64__Vec_String__String_f64::Fourth(s) => {
                Ok(Variant_String_f64::First(s))
            }
            Variant_bool_Vec_f64__Vec_String__String_f64::Fifth(n) => {
                Ok(Variant_String_f64::Second(n))
            }
            _ => Ok(Variant_String_f64::First("holds something else!".into())),
        }
    }

    fn get_variant_enum(
        &self,
        variant: Variant_bool_OldEnum,
    ) -> Result<Variant_bool_OldEnum, String> {
        Ok(variant)
    }

    fn get_variant_weird_numbers_enum(
        &self,
        variant: Variant_bool_WeirdNumbersEnum,
    ) -> Result<Variant_bool_WeirdNumbersEnum, String> {
        Ok(variant)
    }

    fn get_variant_objects(
        &self,
        variant: Variant_Car_Person,
    ) -> Result<Variant_Car_Person, String> {
        Ok(variant)
    }

    fn pass_named_variant(&self, variant: NamedVariant) -> Result<NamedVariant, String> {
        Ok(variant)
    }

    fn pass_all_empty_object_variant(
        &self,
        variant: Variant_std__sync__Arc_dyn_HybridBaseSpec__OptionalWrapper,
    ) -> Result<Variant_std__sync__Arc_dyn_HybridBaseSpec__OptionalWrapper, String> {
        Ok(variant)
    }

    fn bounce_complex_variant(
        &self,
        variant: CoreTypesVariant,
    ) -> Result<CoreTypesVariant, String> {
        Ok(variant)
    }

    fn create_child(&self) -> Result<Arc<dyn HybridChildSpec>, String> {
        Err("Cannot create HybridChild from Rust".into())
    }

    fn create_base(&self) -> Result<Arc<dyn HybridBaseSpec>, String> {
        Err("Cannot create HybridBase from Rust".into())
    }

    fn create_base_actual_child(&self) -> Result<Arc<dyn HybridBaseSpec>, String> {
        Err("Cannot create HybridBase from Rust".into())
    }

    fn bounce_child(
        &self,
        child: Arc<dyn HybridChildSpec>,
    ) -> Result<Arc<dyn HybridChildSpec>, String> {
        Ok(child)
    }

    fn bounce_base(
        &self,
        base: Arc<dyn HybridBaseSpec>,
    ) -> Result<Arc<dyn HybridBaseSpec>, String> {
        Ok(base)
    }

    fn bounce_child_base(
        &self,
        _child: Arc<dyn HybridChildSpec>,
    ) -> Result<Arc<dyn HybridBaseSpec>, String> {
        Err("Cannot cast HybridChild to HybridBase in Rust".into())
    }

    fn cast_base(&self, _base: Arc<dyn HybridBaseSpec>) -> Result<Arc<dyn HybridChildSpec>, String> {
        Err("Cannot cast Base to Child in Rust".into())
    }

    fn callback_sync(&self, callback: Box<dyn Fn() -> f64 + Send + Sync>) -> Result<f64, String> {
        Ok(callback())
    }

    fn get_is_view_blue(&self, _view: Arc<dyn HybridTestViewSpec>) -> Result<bool, String> {
        Err("Cannot access HybridTestView from Rust".into())
    }

    fn bounce_external_hybrid(
        &self,
        external_object: Arc<dyn HybridSomeExternalObjectSpec>,
    ) -> Result<Arc<dyn HybridSomeExternalObjectSpec>, String> {
        Ok(external_object)
    }

    fn create_internal_object(&self) -> Result<Arc<dyn HybridSomeExternalObjectSpec>, String> {
        Err("Cannot create HybridSomeInternalObject from Rust".into())
    }

    fn bounce_external_struct(
        &self,
        external_struct: ExternalObjectStruct,
    ) -> Result<ExternalObjectStruct, String> {
        Ok(external_struct)
    }

    fn bounce_external_variant(
        &self,
        variant: StringOrExternal,
    ) -> Result<StringOrExternal, String> {
        Ok(variant)
    }

    fn create_external_variant_from_func(
        &self,
        factory: Box<dyn Fn() -> Arc<dyn HybridSomeExternalObjectSpec> + Send + Sync>,
    ) -> Result<Arc<dyn HybridSomeExternalObjectSpec>, String> {
        Ok(factory())
    }
}
