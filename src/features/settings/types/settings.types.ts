export type FarmSettingsRow = {
  farm_id: string;
  farm_name: string;
  timezone: string;
  alert_email: string;
  notify_push: boolean;
  notify_sms: boolean;
  temperature_high_c: number;
  ammonia_max_ppm: number;
  updated_at: string;
};

export type FarmSettings = {
  farmId: string;
  farmName: string;
  timezone: string;
  alertEmail: string;
  notifyPush: boolean;
  notifySms: boolean;
  temperatureHighC: number;
  ammoniaMaxPpm: number;
  updatedAt: string;
};

export type UpdateFarmSettingsInput = {
  farmName: string;
  timezone: string;
  alertEmail: string;
  notifyPush: boolean;
  notifySms: boolean;
  temperatureHighC: number;
  ammoniaMaxPpm: number;
};
