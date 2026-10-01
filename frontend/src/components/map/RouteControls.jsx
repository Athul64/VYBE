import React from 'react';
import { Navigation, CloudRain, Accessibility, MapPin, Shuffle } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const RouteControls = ({
  nodes = {},
  fromNode,
  toNode,
  stepFree,
  rainMode,
  onChangeFrom,
  onChangeTo,
  onToggleStepFree,
  onToggleRainMode,
  onFindRoute,
  onSwapPoints
}) => {
  return (
    <div className="border-[3px] border-pencil border-wobbly-md bg-white p-4 shadow-sketch">
      <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-pencil/20 pb-2">
        <h4 className="font-marker text-xl text-pencil flex items-center gap-2">
          <Navigation className="w-5 h-5 text-marker-blue stroke-[2.5]" />
          Route Settings
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwapPoints}
            title="Swap Origin & Destination"
            className="p-1.5 border-2 border-pencil border-wobbly bg-paper-muted hover:bg-paper-yellow transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-pencil stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Origin and Destination selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-hand uppercase tracking-wider text-pencil/70 mb-1 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2d5da1] inline-block"></span>
            Start Point (Origin)
          </label>
          <select
            value={fromNode}
            onChange={(e) => onChangeFrom(e.target.value)}
            className="w-full font-hand text-base border-2 border-pencil border-wobbly px-3 py-1.5 bg-paper-bg focus:outline-none focus:ring-2 focus:ring-marker-blue cursor-pointer"
          >
            {Object.entries(nodes).map(([id, node]) => (
              <option key={id} value={id}>
                {id}: {node.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-hand uppercase tracking-wider text-pencil/70 mb-1 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-marker-red inline-block"></span>
            Destination (Venue / Gate)
          </label>
          <select
            value={toNode}
            onChange={(e) => onChangeTo(e.target.value)}
            className="w-full font-hand text-base border-2 border-pencil border-wobbly px-3 py-1.5 bg-paper-bg focus:outline-none focus:ring-2 focus:ring-marker-red cursor-pointer"
          >
            {Object.entries(nodes).map(([id, node]) => (
              <option key={id} value={id}>
                {id}: {node.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-dashed border-pencil/20">
        <div className="flex items-center gap-3">
          {/* Step Free Toggle */}
          <button
            onClick={onToggleStepFree}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm md:text-base font-hand font-bold border-2 border-pencil border-wobbly transition-all cursor-pointer ${
              stepFree 
                ? 'bg-marker-blue text-white shadow-sketchHover translate-x-[1px] translate-y-[1px]' 
                : 'bg-paper-bg hover:bg-paper-muted text-pencil'
            }`}
          >
            <Accessibility className="w-4 h-4 stroke-[2.5]" />
            <span>Step-Free (No Stairs)</span>
            {stepFree && <span className="text-xs bg-white text-marker-blue px-1 rounded-sm">ON</span>}
          </button>

          {/* Rain Mode Toggle */}
          <button
            onClick={onToggleRainMode}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm md:text-base font-hand font-bold border-2 border-pencil border-wobbly transition-all cursor-pointer ${
              rainMode 
                ? 'bg-[#2d5da1] text-white shadow-sketchHover translate-x-[1px] translate-y-[1px]' 
                : 'bg-paper-bg hover:bg-paper-muted text-pencil'
            }`}
          >
            <CloudRain className="w-4 h-4 stroke-[2.5]" />
            <span>Rain Mode (Sheltered)</span>
            {rainMode && <span className="text-xs bg-white text-marker-blue px-1 rounded-sm">ON</span>}
          </button>
        </div>

        <SketchButton variant="primary" onClick={onFindRoute} className="!py-1.5 !px-4 text-base">
          Update Route
        </SketchButton>
      </div>
    </div>
  );
};
