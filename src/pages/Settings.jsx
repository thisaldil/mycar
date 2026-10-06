import { Link } from 'react-router-dom';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { authApi } from '../services/authApi';
import { downloadText } from '../utils/files';
import { CURRENCIES, LANGUAGES } from '../data/options';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader } from '../components/common/Card';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Select } from '../components/common/Select';
import { Switch } from '../components/common/Switch';
import { Button } from '../components/common/Button';
import { toast } from '../components/common/Toast';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const n = settings.notifications;
  const p = settings.privacy;
  const setN = (k) => (v) => updateSettings({ notifications: { [k]: v } });
  const setP = (k) => (v) => updateSettings({ privacy: { [k]: v } });

  const exportData = async () => {
    try {
      const data = await authApi.exportData();
      downloadText(JSON.stringify(data, null, 2), 'carlife-export.json', 'application/json');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Changes save automatically." />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Appearance" />
          <SegmentedControl ariaLabel="Theme" value={settings.theme} onChange={(theme) => updateSettings({ theme })} options={[{ value: 'light', label: 'Light', icon: SunIcon }, { value: 'dark', label: 'Dark', icon: MoonIcon }, { value: 'system', label: 'System', icon: MonitorIcon }]} />
        </Card>
        <Card>
          <CardHeader title="Language & units" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Language & date format" options={LANGUAGES} value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })} />
            <Select label="Currency" options={CURRENCIES} value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} />
          </div>
          <p className="mb-2 mt-5 text-sm font-medium text-ink">Units</p>
          <SegmentedControl ariaLabel="Units" value={settings.units} onChange={(units) => updateSettings({ units })} options={[{ value: 'metric', label: 'Kilometres & litres' }, { value: 'imperial', label: 'Miles & gallons' }]} />
        </Card>
        <Card>
          <CardHeader title="Notifications" description="Choose what shows up in your notification bell." />
          <div className="divide-y divide-line">
            <Switch label="Service reminders" checked={n.service} onChange={setN('service')} />
            <Switch label="Insurance renewals" checked={n.insurance} onChange={setN('insurance')} />
            <Switch label="Inspections" checked={n.inspection} onChange={setN('inspection')} />
            <Switch label="Other reminders" description="Tyres, battery, warranty, finance" checked={n.other} onChange={setN('other')} />
            <Switch label="Email notifications" checked={n.email} onChange={setN('email')} />
            <Switch label="Weekly summary email" checked={n.weeklySummary} onChange={setN('weeklySummary')} />
          </div>
          <Select className="mt-4 sm:w-64" label="Warn me ahead by" options={[{ value: '14', label: '14 days' }, { value: '30', label: '30 days' }, { value: '60', label: '60 days' }]} value={String(n.leadDays)} onChange={(e) => updateSettings({ notifications: { leadDays: Number(e.target.value) } })} />
        </Card>
        <Card>
          <CardHeader title="Privacy" />
          <div className="divide-y divide-line">
            <Switch label="Hide registration numbers" description="Masks plates on screen — useful when sharing your screen." checked={p.maskRegistration} onChange={setP('maskRegistration')} />
            <Switch label="Share anonymous usage analytics" checked={p.analytics} onChange={setP('analytics')} />
            <Switch label="Send crash reports" checked={p.crashReports} onChange={setP('crashReports')} />
          </div>
          <Button variant="secondary" className="mt-4" onClick={exportData}>Download my data</Button>
        </Card>
        <Card>
          <CardHeader title="Security" description="Manage your password from your profile." />
          <Link to="/profile" className="text-sm font-medium text-brand hover:underline">Change password</Link>
        </Card>
      </div>
    </div>);

}