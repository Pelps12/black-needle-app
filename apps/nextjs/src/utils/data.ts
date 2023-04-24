export interface ServicesOption {
	readonly value: string;
	readonly label: string;
	readonly isFixed?: boolean;
	readonly isDisabled?: boolean;
}

export const colourOptions: readonly ServicesOption[] = [
	{ value: 'catering', label: 'Catering' },
	{ value: 'hairdressing', label: 'Hairdressing' },
	{ value: 'accessories', label: 'Accessories' }
];
