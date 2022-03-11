import React, { useEffect, useState } from "react";
import { differenceInMinutes, format } from "date-fns";
import {
  AlertDialog,
  Button,
  Modal,
  Skeleton,
  Text,
  Pressable,
} from "native-base";
import { Image, Alert } from "react-native";
import { useMutation } from "@apollo/client";

import { View } from "../Themed";
import { Ticket } from "../../types/types";
import { DELETE_TICKET_BY_ID } from "../../utils/gql";

import Loader from "../loader/loader.component";

import { styles } from "./ticket-list-item.styles";

type Props = {
  ticket: Ticket;
  hideActions?: boolean;
  onDelete: (id: string) => void;
};

const TicketListItem: React.FC<Props> = ({
  ticket,
  hideActions = false,
  onDelete,
}) => {
  const ticketDate = new Date(ticket.session.datetime * 1000);
  const isUsed = ticketDate.valueOf() < new Date().valueOf();
  const canCancel = differenceInMinutes(ticketDate, new Date()) > 30;

  const [imgLoading, setImgLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const cancelRef = React.useRef(null);

  const [deleteTicket, { loading }] = useMutation(DELETE_TICKET_BY_ID, {
    update(_, { data }) {
      onDelete(ticket.id);
    },
    onError(err) {
      console.log(JSON.stringify(err, null, 2));
      setIsLoading(false);
      Alert.alert("ERROR", err?.message);
    },
    variables: { id: ticket.id },
  });

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const onPress = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowAlert(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setShowAlert(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    setShowAlert(false);
    console.log("TICKET:", ticket.id);
    deleteTicket({ variables: { id: ticket.id } });
  };

  return ticket ? (
    isLoading ? (
      <Loader />
    ) : (
      <Pressable
        onPress={onPress}
        style={styles.container}
        borderColor={isUsed ? "#831843" : "#701a75"}
        backgroundColor={isUsed ? "#831843" : "#be185d"}
      >
        <View style={styles.ticket}>
          {imgLoading ? (
            <View style={styles.skeletonContainer}>
              <Skeleton style={styles.skeleton} />
            </View>
          ) : null}
          <Image
            style={styles.img}
            source={{
              uri: ticket?.session?.movie?.imgUrl,
              cache: "force-cache",
            }}
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
            onLoad={() => setImgLoading(false)}
          />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} isTruncated color="white">
            {ticket?.session?.movie?.name}
          </Text>
          <Text style={styles.body} noOfLines={4} isTruncated color="white">
            {`Date: ${format(ticketDate, "dd.MM.yyyy")}`}
          </Text>
          <Text style={styles.body} noOfLines={4} isTruncated color="white">
            {`Time: ${format(ticketDate, "HH:mm")}`}
          </Text>
          <Text style={styles.body} noOfLines={4} isTruncated color="white">
            {`Hall: ${ticket.session.hall.name}`}
          </Text>
          <Text style={styles.body} noOfLines={4} isTruncated color="white">
            {`Number of seats: ${ticket.seats.length}`}
          </Text>
        </View>
        <View style={styles.circle} />
        <View style={styles.endCircle} />
        <Modal isOpen={showModal} onClose={handleClose}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Ticket</Modal.Header>
            <Modal.Body>
              <Text mb={4} color="black">{`Status: ${ticket.status}`}</Text>
              <Text mb={4} color="black">{`Price: HK$${ticket.price}`}</Text>
              <Text mb={4} color="black">
                {`Movie: ${ticket.session.movie.name}`}
              </Text>
              <Text mb={4} color="black">
                {`Date: ${format(ticketDate, "dd.MM.yyyy")}`}
              </Text>
              <Text mb={6} color="black">
                {`Time: ${format(ticketDate, "HH:mm")}`}
              </Text>
              <Text mb={1} color="black">
                Seats:
              </Text>
              {ticket.seats.map((s) => (
                <Text key={s.id} mb={4} color="black">
                  {`Row: ${s.seat.rowNumber}, Seat: ${s.seat.seatNumber}${
                    s.type?.length ? `, Rate: ${s.type}` : ""
                  }`}
                </Text>
              ))}
            </Modal.Body>
            {canCancel && !hideActions ? (
              <Modal.Footer>
                <Button.Group space={2}>
                  <Button
                    variant="solid"
                    colorScheme="danger"
                    onPress={handleCancel}
                  >
                    Cancel Ticket
                  </Button>
                </Button.Group>
              </Modal.Footer>
            ) : null}
          </Modal.Content>
        </Modal>
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={showAlert}
          onClose={handleClose}
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header>Remove Ticket</AlertDialog.Header>
            <AlertDialog.Body>
              Are you sure you want to remove this ticket ?
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button.Group space={2}>
                <Button
                  variant="unstyled"
                  colorScheme="coolGray"
                  onPress={handleClose}
                  ref={cancelRef}
                >
                  Cancel
                </Button>
                <Button colorScheme="danger" onPress={handleConfirm}>
                  Confirm
                </Button>
              </Button.Group>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </Pressable>
    )
  ) : null;
};

export default TicketListItem;
