import React from 'react';
import Input from '@/components/common/Input/Input';

interface FormInputProps extends React.ComponentProps<typeof Input> {
}

const FormInput: React.FC<FormInputProps> = (props) => {
  return <Input {...props} />;
};

export default FormInput; 