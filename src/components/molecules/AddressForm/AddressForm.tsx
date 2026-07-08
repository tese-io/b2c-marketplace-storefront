'use client';

import { FC, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { HttpTypes } from '@medusajs/types';
import { FieldError, FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { LabeledInput } from '@/components/cells';
import CountrySelect from '@/components/cells/CountrySelect/CountrySelect';
import { addCustomerAddress, updateCustomerAddress } from '@/lib/data/customer';

import { AddressFormData, addressSchema } from './schema';

interface Props {
  defaultValues?: AddressFormData;

  regions: HttpTypes.StoreRegion[];
  handleClose?: () => void;
}

export const emptyDefaultAddressValues = {
  addressName: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  countryCode: '',
  postalCode: '',
  company: '',
  province: '',
  phone: '',
  metadata: {}
};

export const AddressForm: FC<Props> = ({ defaultValues, ...props }) => {
  const methods = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || emptyDefaultAddressValues
  });

  return (
    <FormProvider {...methods}>
      <Form {...props} />
    </FormProvider>
  );
};

const Form: FC<Props> = ({ regions, handleClose }) => {
  const [error, setError] = useState<string>();
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch
  } = useFormContext();

  const region = {
    countries: regions.flatMap(region => region.countries)
  };

  const submit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append('addressId', data.addressId || '');
    formData.append('address_name', data.addressName);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('address_1', data.address);
    formData.append('address_2', '');
    formData.append('province', data.province);
    formData.append('city', data.city);
    formData.append('country_code', data.countryCode);
    formData.append('postal_code', data.postalCode);
    formData.append('company', data.company);
    formData.append('phone', data.phone);

    const res = data.addressId
      ? await updateCustomerAddress(formData)
      : await addCustomerAddress(formData);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setError('');
    handleClose && handleClose();
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="tese-address-form"
      data-testid="address-form"
    >
      <div className="tese-address-form-grid">
        <LabeledInput
          label="Address name"
          placeholder="e.g. Warehouse, Office"
          className="tese-address-form-span-2"
          error={errors.addressName as FieldError}
          data-testid="address-form-address-name-input"
          {...register('addressName')}
        />
        <LabeledInput
          label="First name"
          placeholder="First name"
          error={errors.firstName as FieldError}
          data-testid="address-form-first-name-input"
          {...register('firstName')}
        />
        <LabeledInput
          label="Last name"
          placeholder="Last name"
          error={errors.lastName as FieldError}
          data-testid="address-form-last-name-input"
          {...register('lastName')}
        />
        <LabeledInput
          label="Company (optional)"
          placeholder="Company name"
          error={errors.company as FieldError}
          data-testid="address-form-company-input"
          {...register('company')}
        />
        <LabeledInput
          label="Street address"
          placeholder="Street and number"
          error={errors.address as FieldError}
          data-testid="address-form-address-input"
          {...register('address')}
        />
        <LabeledInput
          label="City"
          placeholder="City"
          error={errors.city as FieldError}
          data-testid="address-form-city-input"
          {...register('city')}
        />
        <LabeledInput
          label="Postal code"
          placeholder="Postal code"
          error={errors.postalCode as FieldError}
          data-testid="address-form-postal-code-input"
          {...register('postalCode')}
        />
        <LabeledInput
          label="State / province"
          placeholder="State or province"
          error={errors.province as FieldError}
          data-testid="address-form-province-input"
          {...register('province')}
        />
        <div className="tese-address-form-country">
          <CountrySelect
            region={region as HttpTypes.StoreRegion}
            {...register('countryCode')}
            value={watch('countryCode')}
            data-testid="address-form-country-select"
          />
          {errors.countryCode ? (
            <p
              className="tese-address-form-error"
              data-testid="address-form-country-error"
            >
              {(errors.countryCode as FieldError).message}
            </p>
          ) : null}
        </div>
        <LabeledInput
          label="Phone"
          placeholder="Phone number"
          className="tese-address-form-span-2"
          error={errors.phone as FieldError}
          data-testid="address-form-phone-input"
          {...register('phone')}
        />
      </div>
      {error ? (
        <p className="tese-address-form-error" data-testid="address-form-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="tese-inquiry-btn-primary tese-address-form-submit"
        data-testid="address-form-submit-button"
      >
        Save address
      </button>
    </form>
  );
};
