import { WeatherData, ForecastData, Measurements } from "@/types";
import { useState } from "react";
import { 
    timeOnlyUtil, 
    fullDateNoTime,
    dayWithNameUtilWithCustom 
} from "@/utils/dateTimeUtils";
import BaseWeatherIcon from "../../BaseComponents/BaseWeatherIcon";
import SvgInline from "../../Common/SvgInline";
import CommonButton from "@/components/Common/CommonButton";

type GroupedWeatherData = {
    [key: string]: ForecastData[];
};

type handleDateSelectionBtn = {
    buttonIndex: number;
    date: string;
};

const convertTimeStampToDate = (timestamp: number): string => {
    const dateNow = new Date(timestamp);
    return timeOnlyUtil(dateNow);
};

const convertStringToDate = (date: string): string => {
    return dayWithNameUtilWithCustom(date);
};

export function StationWeatherForecastDetails(elem: WeatherData) {
    const title = "Next 5 days";
    const dateNow = new Date();
    const [activeBtn, setActiveBtn] = useState(0);
    const [forecastDate, setForecastDate] = useState(fullDateNoTime(dateNow));

    const structuredForecast = elem.full_forecast.reduce((acc: GroupedWeatherData, currentItem) => {
        const currentForecastTime = new Date(currentItem.time);
        const date = fullDateNoTime(currentForecastTime);
        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(currentItem);
        return acc;
    },{});

    const handleDateSelectionBtn = ({ buttonIndex, date }:handleDateSelectionBtn ) => {
        setActiveBtn(buttonIndex);
        setForecastDate(date);
    };

    const getExtremeDayValues = (date:string) => {
        const valuesArr = [];
        for(const value of structuredForecast[date]) {
            valuesArr.push(value.temperature);
        }
        return {
            max: Math.max(...valuesArr),
            min: Math.min(...valuesArr),
        };
    };

    return (
        <div className="p-1">
            <h4 className="my-4 text-xs font-bold uppercase text-primary">
                {title}
            </h4>
            <div className="flex gap-2 overflow-x-auto">
                {Object.keys(structuredForecast).map((item,index) => {
                    const activeClass = activeBtn === index ? "!bg-info text-white" : "";
                    return (
                        <div 
                            key={item}
                            className="w-full"
                        >
                            <CommonButton
                                color="primary"
                                className={`w-full rounded-lg bg-light_white p-2 text-sm ${activeClass}`}
                                handleClick={() => handleDateSelectionBtn({
                                    buttonIndex: index,
                                    date: item,
                                })}
                            >
                                <div className="flex h-16 items-center gap-4">
                                    <div className="w-full">
                                        <p className="text-sm font-bold">
                                            {convertStringToDate(item)}
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-col">
                                        <p>
                                            {getExtremeDayValues(item).max}
                                        </p>
                                        <p>
                                            {getExtremeDayValues(item).min}
                                        </p>
                                    </div>
                                </div>
                            </CommonButton>
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 max-h-[280px] overflow-y-auto">
                {structuredForecast[forecastDate].map((forecast,index, forecastArray) => {
                    const forecastTime = new Date(forecast.time);
                    const shouldRenderForecast = index === forecastArray.length - 1 
                        ? true 
                        : forecastTime.valueOf() > dateNow.valueOf() ? true : false;
                    return ( shouldRenderForecast && 
                        <div 
                            key={index}
                            className="my-4 flex items-center justify-between gap-2 rounded-lg p-2 shadow"
                        >
                            <p className="text-primary opacity-60">
                                { convertTimeStampToDate(forecast.time )}
                            </p>
                            <div className="size-10">
                                <BaseWeatherIcon
                                    assetId={forecast.forecastIcon}
                                    weatherDescriptionText={elem.station.name}
                                ></BaseWeatherIcon>
                            </div>
                            <p className="text-primary">
                                { forecast.temperature}
                                <span className="ml-1 text-sm">
                                    {Measurements.CELCIUS}
                                </span>
                            </p>
                            <div className="flex items-center">
                                <div className="h-4 w-6">
                                    <SvgInline
                                        path="weather_icons/wind.svg"
                                        title="Wind icon"
                                        className="fill-primary"
                                        style={{
                                            transform: `rotate(${forecast.winddir}deg)`,
                                        }}
                                    />
                                </div>
                                <p className="ml-1 text-primary">
                                    {forecast.windspd}
                                    <span className="ml-1 text-sm">
                                        {Measurements.SPEED}
                                    </span>
                                </p>
                            </div>
                            <p className="text-primary">
                                { forecast.percipitation}
                                <span className="ml-1 text-sm">
                                    {Measurements.MILLIMETER}
                                </span>
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}