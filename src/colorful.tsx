import { h, FunctionComponent } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";

import "./style.css";

interface ColorFulProps {
	color: string;
}

const cursurSize = 12;

const ColorFul: FunctionComponent<ColorFulProps> = ({
	color,
}) => {
	const staturationRef = useRef<HTMLDivElement>(null);
	const hueRef = useRef<HTMLDivElement>(null);

	const [pointerId, setPointerId] = useState<number>(0);
	// state
	const [hue, setHue] = useState<number>(0);
	const [saturation, setSaturation] = useState<number>(0);
	const [value, setValue] = useState<number>(0);
	const [cursorSaturation, setCursorSaturation] = useState<{
		x: number;
		y: number;
	}>({
		x: 0,
		y: 0,
	})
	const [cursorHue, setCursorHue] = useState<number>(0);

	/**
	 * `props.color` 가 업데이트 될때 갱신합니다.
	 */
	const rgbToHsv = useCallback((rgb: string) => {
		const r = parseInt(rgb.slice(1, 3), 16) / 255;
		const g = parseInt(rgb.slice(3, 5), 16) / 255;
		const b = parseInt(rgb.slice(5, 7), 16) / 255;

		let h = 0, s = 0, v = 0;

		const rgbMin = Math.min(r, g, b); // r < g ? (r < b ? r : b) : (g < b ? g : b);
		const rgbMax = Math.max(r, g, b); // r > g ? (r > b ? r : b) : (g > b ? g : b);
		
		const l = (rgbMax + rgbMin) / 2;
		if (rgbMax !== rgbMin) {
			const c = rgbMax - rgbMin;
			s = c / (1 - Math.abs(2 * l - 1));

			switch (rgbMax) {
				case r:
					break;
				case g:
					h = (b - r) / c + 2;
					break;
				case b:
					h = (r - g) / c + 4;
					break;
			}
		}

		h = Math.round(h * 60);

		v = s*Math.min(l, 1-l) + l;
		s = v ? 2-2 * l / v : 0;

		s = Math.round(s * 100);
		v = Math.round(v * 100);

		return [h, s, v];
	}, []);

	/**
	 * 현재 포인터 위치에 대한 x, y정보를 가져옵니다. 해당함수는 한번만 업데이트 됩니다.
	 */
	const getPointerOffset = useCallback((e: PointerEvent) => {
		let x = 0, y = 0;
		if (e.currentTarget) {
			const element = e.currentTarget as HTMLElement;
			const rect = element.getBoundingClientRect();
			x = Math.min(element.offsetWidth, Math.max(0, e.clientX - rect.left));
			y = Math.min(element.offsetHeight, Math.max(0, e.clientY - rect.top));
		}
		return {
			x, y,
		};
	}, []);

	const updateHue = useCallback((e: PointerEvent) => {
		e.preventDefault();

		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const hue = e.currentTarget as HTMLDivElement;
			const offsetX = getPointerOffset(e).x;

			setHue(Math.round(360 * (offsetX / hue.offsetWidth))),
			setCursorHue(offsetX);
		}
	}, [getPointerOffset]);

	const updateSaturation = useCallback((e: PointerEvent) => {
		e.preventDefault();
		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const saturation = e.currentTarget as HTMLElement;
			const { x, y } = getPointerOffset(e);

			setCursorSaturation({ x, y });
			setSaturation(Math.round(100 * (x / saturation.offsetWidth)));
			setValue(100 - Math.round(100 * (y / saturation.offsetHeight)));
		}
	}, [getPointerOffset]);

	useEffect(() => {
		const hsv = rgbToHsv(color);

		setHue(hsv[0]);
		setSaturation(hsv[1]);
		setValue(hsv[2]);

		if (staturationRef.current) {
			const width = staturationRef.current.offsetWidth;
			const height = staturationRef.current.offsetWidth;

			setCursorSaturation({
				x: width - (width * (hsv[0] / 360)),
				y: height - (height * (hsv[1] / 100))
			})
		}

		if (hueRef.current) {
			const width = hueRef.current.offsetWidth;
			setCursorHue(width - (width * (hsv[2] / 100)));
		}
	}, [color, rgbToHsv]);

	const l = useMemo(() => ((2 - saturation / 100) * value / 2), [saturation, value]);
	const s = useMemo(() => (saturation * value / (l < 50 ? l * 2 : 200 - l * 2)), [saturation, value, l]);


	console.log(hue, saturation, value, l, s);

	return <div className="colorful">
			<div
				className="saturation"
				ref={staturationRef}
				style={{
					background: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,0), hsl(${hue},100%, 50%))`
				}}
				onPointerDown={(e): void => {
					if (pointerId !== 0) return;

					const staturation = e.currentTarget as HTMLDivElement;
					if (staturation) {
						setPointerId(e.pointerId);
						updateSaturation(e);

						staturation.setPointerCapture(e.pointerId);
						staturation.onpointermove = updateSaturation.bind(this);
					}
				}}
				onPointerUp={(e): void => {
					if (e.pointerId !== pointerId) return;
					const staturation = e.currentTarget as HTMLDivElement;
					if (staturation) {
						staturation.onpointermove = null;
						staturation.releasePointerCapture(pointerId);
						setPointerId(0);
					}
				}}
			>
				<div
					className="saturation_pointer"
					style={{
						top: cursorSaturation.y - cursurSize,
						left: cursorSaturation.x - cursurSize,
					}}
					onPointerDown={(e): void => {
						const eventClone = new PointerEvent(e.type, e);
						if (staturationRef.current)
							staturationRef.current.dispatchEvent(eventClone);
					}}
				>
					<div
						className="saturation_pointer_fill"
						style={{
							background: `hsl(${hue},${s}%, ${l}%)`,
						}}
					/>
				</div>
			</div>
			<div
				ref={hueRef}
				className="hue"
				onPointerDown={(e): void => {
					if (pointerId !== 0) return;

					const hue = e.currentTarget as HTMLDivElement;
					if (hue) {
						setPointerId(e.pointerId);
						updateHue(e);

						hue.setPointerCapture(e.pointerId);
						hue.onpointermove = updateHue;
					}
				}}
				onPointerUp={(e): void => {
					if (e.pointerId !== pointerId) return;
					const hue = e.currentTarget as HTMLDivElement;
					if (hue) {
						hue.onpointermove = null;
						hue.releasePointerCapture(e.pointerId);
						setPointerId(0);
					}
				}}
			>
				<div
					className="hue_pointer"
					style={{
						left: cursorHue - cursurSize,
					}}
					onPointerDown={(e): void => {
						const eventClone = new PointerEvent(e.type, e);
						if (hueRef.current)
							hueRef.current.dispatchEvent(eventClone);
					}}
				>
					<div
						className="hue_pointer_fill"
						style={{
							background: `hsl(${hue}, 100%, 50%)`,
						}}
					/>
				</div>
			</div>
	</div>;
};

ColorFul.defaultProps = {
	color: "#ff0000",
};

export default ColorFul;
