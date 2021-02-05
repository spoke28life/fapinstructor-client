import React from "react";
import PatreonIcon from "components/molecules/icons/PatreonIcon";
import AnchorButton from "components/atoms/AnchorButton";
import MenuItem from "components/templates/MenuItem";

const PatreonMenuButton = () => {
  return (
    <AnchorButton href="https://www.patreon.com/bePatron?u=29098019">
      <MenuItem title="Support this site!" icon={<PatreonIcon size={20} />} />
    </AnchorButton>
  );
};

export default PatreonMenuButton;
