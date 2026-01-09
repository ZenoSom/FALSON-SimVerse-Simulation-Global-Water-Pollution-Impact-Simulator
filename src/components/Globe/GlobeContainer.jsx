import React, { useRef } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import * as Cesium from 'cesium';
import { useSimulation } from '../../context/SimulationContext';

// Force Cesium to use local assets (or default Ion if available)
// window.CESIUM_BASE_URL = '/'; 

/* Hide Credits CSS */
const creditStyle = `
  .cesium-widget-credits { display: none !important; }
  .cesium-viewer-bottom { display: none !important; }
`;

const GlobeContainer = () => {
    const viewerRef = useRef(null);
    const { selectedLocation, setSelectedLocation, params, wpi } = useSimulation();

    const handleLeftClick = (movement) => {
        if (!viewerRef.current?.cesiumElement) return;

        const viewer = viewerRef.current.cesiumElement;
        const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);

        if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);

            setSelectedLocation({ lat, lon, cartesian });
        }
    };

    // Convert radius (km) to meters
    const radiusMeters = params.radius * 1000;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <style>{creditStyle}</style>
            <Viewer
                ref={viewerRef}
                full
                timeline={false}
                animation={false}
                baseLayerPicker={false} // clean UI
                navigationHelpButton={false}
                geocoder={false}
                homeButton={false}
                sceneModePicker={false}
                fullscreenButton={false}
                selectionIndicator={false}
                infoBox={false}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <ScreenSpaceEventHandler>
                    <ScreenSpaceEvent
                        action={handleLeftClick}
                        type={Cesium.ScreenSpaceEventType.LEFT_CLICK}
                    />
                </ScreenSpaceEventHandler>

                {/* Selected Location Marker */}
                {selectedLocation && (
                    <Entity
                        position={selectedLocation.cartesian}
                        point={{ pixelSize: 10, color: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 }}
                    />
                )}

                {/* Pollution Radius / Heatmap */}
                {selectedLocation && (
                    <Entity
                        position={selectedLocation.cartesian}
                        ellipse={{
                            semiMajorAxis: radiusMeters,
                            semiMinorAxis: radiusMeters,
                            material: new Cesium.ColorMaterialProperty(
                                // Interpolate color based on WPI
                                // Safe (Green) -> Stressed (Orange) -> Unsafe (Red) using WPI
                                wpi < 0.3 ? Cesium.Color.fromCssColorString('#10b981').withAlpha(0.4) :
                                    wpi < 0.6 ? Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.5) :
                                        Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.6)
                            ),
                            height: 0, // Draped on ellipsoid
                        }}
                    />
                )}

                {/* Additional Layers can be added here as separate entities with offsets if needed */}

            </Viewer>
        </div>
    );
};

export default GlobeContainer;
