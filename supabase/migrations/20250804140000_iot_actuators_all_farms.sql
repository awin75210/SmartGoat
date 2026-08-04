-- Provision default IoT actuators for every farm (multi-tenant)

insert into iot_actuator_states (farm_id, actuator_key, name, gpio, device_type, is_on, position_pct, status)
select f.id, v.actuator_key, v.name, v.gpio, v.device_type, false, v.position_pct, 'offline'
from farms f
cross join (
  values
    ('relay_in1', 'Đèn sưởi IR', 25, 'relay', null::int),
    ('relay_in2', 'Quạt làm mát / hút', 26, 'relay', null::int),
    ('relay_in3', 'Bơm mini phun sương', 27, 'relay', null::int),
    ('relay_in4', 'Dự phòng (quạt phụ / đèn UV)', 14, 'relay', null::int),
    ('servo_roof', 'Mái che thông minh', null::int, 'servo', 0)
) as v(actuator_key, name, gpio, device_type, position_pct)
where not exists (
  select 1
  from iot_actuator_states a
  where a.farm_id = f.id and a.actuator_key = v.actuator_key
);
