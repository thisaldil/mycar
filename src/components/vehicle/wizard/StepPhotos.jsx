import { Controller } from 'react-hook-form';
import { ImageUploader } from '../../common/ImageUploader';
import { StepHeading } from './StepHeading';

export function StepPhotos({ form }) {
  return (
    <div>
      <StepHeading title="Photos" description="Optional. The first photo becomes the cover shown on your dashboard. Photos are resized on your device before upload." />
      <Controller
        name="images"
        control={form.control}
        render={({ field }) => <ImageUploader value={field.value || []} onChange={field.onChange} max={8} altPrefix="Vehicle photo" coverLabel="Cover" />} />
      
    </div>);

}